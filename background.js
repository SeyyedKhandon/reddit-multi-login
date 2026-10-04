// Reddit's web login is cookie based. An "account" here is a snapshot of all
// reddit.com cookies; switching = wipe current cookies, restore the snapshot.

const REDDIT_DOMAIN = "reddit.com";

async function whoAmI() {
  try {
    const res = await fetch("https://www.reddit.com/api/me.json", {
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const name = json?.data?.name;
    if (!name) return null;
    const icon = json.data.icon_img || json.data.snoovatar_img || "";
    return { name, icon: icon.split("?")[0] };
  } catch {
    return null;
  }
}

const cookieUrl = (c) => `https://${c.domain.replace(/^\./, "")}${c.path}`;

async function snapshotCookies() {
  return chrome.cookies.getAll({ domain: REDDIT_DOMAIN });
}

async function clearCookies() {
  const cookies = await snapshotCookies();
  await Promise.all(
    cookies.map((c) => chrome.cookies.remove({ url: cookieUrl(c), name: c.name }))
  );
}

async function restoreCookies(cookies) {
  const now = Date.now() / 1000;
  for (const c of cookies) {
    if (!c.session && c.expirationDate && c.expirationDate < now) continue;
    const details = {
      url: cookieUrl(c),
      name: c.name,
      value: c.value,
      path: c.path,
      secure: c.secure,
      httpOnly: c.httpOnly,
      sameSite: c.sameSite,
    };
    if (!c.hostOnly) details.domain = c.domain;
    if (!c.session) details.expirationDate = c.expirationDate;
    try {
      await chrome.cookies.set(details);
    } catch (e) {
      console.warn("cookie restore failed", c.name, e);
    }
  }
}

async function getAccounts() {
  const { accounts = {} } = await chrome.storage.local.get("accounts");
  return accounts;
}

async function saveAccount(me) {
  const cookies = await snapshotCookies();
  // Another tab may have switched accounts since `me` was read; never store
  // one account's cookies under another's name.
  if ((await whoAmI())?.name !== me.name) return;
  const accounts = await getAccounts();
  accounts[me.name] = {
    name: me.name,
    icon: me.icon,
    cookies,
    savedAt: Date.now(),
    addedAt: accounts[me.name]?.addedAt ?? Date.now(),
  };
  await chrome.storage.local.set({ accounts });
}

// Runs on every reddit page load: if someone is logged in, keep their saved
// snapshot fresh (Reddit rotates token_v2), and auto-save newly logged-in accounts.
async function sync() {
  const me = await whoAmI();
  if (me) await saveAccount(me);
  return state(me);
}

async function state(me) {
  const accounts = await getAccounts();
  const list = Object.values(accounts)
    .sort((a, b) => a.addedAt - b.addedAt)
    .map(({ name, icon }) => ({ name, icon }));
  return { current: me?.name ?? null, accounts: list };
}

async function reloadRedditTabs() {
  const tabs = await chrome.tabs.query({ url: "https://*.reddit.com/*" });
  await Promise.all(tabs.map((t) => chrome.tabs.reload(t.id)));
}

async function switchTo(name) {
  const accounts = await getAccounts();
  const target = accounts[name];
  if (!target) return { error: "Unknown account" };

  const me = await whoAmI();
  if (me?.name === name) return state(me);
  if (me) await saveAccount(me); // keep the account we're leaving up to date

  await clearCookies();
  await restoreCookies(target.cookies);

  const after = await whoAmI();
  if (after?.name !== name) {
    // Session was invalidated server-side (e.g. user hit "Log out" on Reddit).
    await clearCookies();
    await reloadRedditTabs();
    return {
      error: `The saved session for u/${name} has expired. Log in again to refresh it.`,
      ...(await state(null)),
    };
  }
  await reloadRedditTabs();
  return state(after);
}

async function addAccount() {
  const me = await whoAmI();
  if (me) await saveAccount(me);
  await clearCookies();
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  const url = "https://www.reddit.com/login/";
  if (tab && /^https:\/\/([^/]*\.)?reddit\.com\//.test(tab.url ?? "")) {
    await chrome.tabs.update(tab.id, { url });
  } else {
    await chrome.tabs.create({ url });
  }
  await reloadRedditTabsExcept(tab?.id);
  return { ok: true };
}

async function reloadRedditTabsExcept(activeId) {
  const tabs = await chrome.tabs.query({ url: "https://*.reddit.com/*" });
  await Promise.all(
    tabs.filter((t) => t.id !== activeId).map((t) => chrome.tabs.reload(t.id))
  );
}

async function removeAccount(name) {
  const accounts = await getAccounts();
  delete accounts[name];
  await chrome.storage.local.set({ accounts });
  return state(await whoAmI());
}

const handlers = {
  sync: () => sync(),
  state: async () => state(await whoAmI()),
  switch: ({ name }) => switchTo(name),
  add: () => addAccount(),
  remove: ({ name }) => removeAccount(name),
};

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  const handler = handlers[msg?.type];
  if (!handler) return false;
  handler(msg).then(sendResponse, (e) => sendResponse({ error: String(e) }));
  return true; // async response
});
