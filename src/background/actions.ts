import { LOGIN_URL, REDDIT_TABS, isRedditUrl } from "../shared/reddit";
import type { AppState } from "../shared/types";
import type { SwitchResult } from "../shared/messages";
import { forgetAccount, getAccounts, saveAccount, state } from "./accounts";
import { clearCookies, restoreCookies } from "./cookies";
import { whoAmI } from "./identity";

async function reloadRedditTabs(exceptTabId?: number): Promise<void> {
  const tabs = await chrome.tabs.query({ url: REDDIT_TABS });
  await Promise.all(
    tabs
      .filter((t) => t.id !== undefined && t.id !== exceptTabId)
      .map((t) => chrome.tabs.reload(t.id!))
  );
}

/**
 * Runs on every reddit page load: if someone is logged in, keep their saved
 * snapshot fresh (Reddit rotates token_v2), and auto-save newly logged-in accounts.
 */
export async function sync(): Promise<AppState> {
  const me = await whoAmI();
  if (me) await saveAccount(me);
  return state(me);
}

export async function currentState(): Promise<AppState> {
  return state(await whoAmI());
}

export async function switchTo(name: string): Promise<SwitchResult> {
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

export async function addAccount(): Promise<{ ok: true }> {
  const me = await whoAmI();
  if (me) await saveAccount(me);
  await clearCookies();
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id !== undefined && isRedditUrl(tab.url)) {
    await chrome.tabs.update(tab.id, { url: LOGIN_URL });
  } else {
    await chrome.tabs.create({ url: LOGIN_URL });
  }
  await reloadRedditTabs(tab?.id);
  return { ok: true };
}

export async function removeAccount(name: string): Promise<AppState> {
  await forgetAccount(name);
  return state(await whoAmI());
}
