import { REDDIT_DOMAIN } from "../shared/reddit";

type Cookie = chrome.cookies.Cookie;

export const cookieUrl = (c: Pick<Cookie, "domain" | "path">): string =>
  `https://${c.domain.replace(/^\./, "")}${c.path}`;

export const snapshotCookies = (): Promise<Cookie[]> =>
  chrome.cookies.getAll({ domain: REDDIT_DOMAIN });

export async function clearCookies(): Promise<void> {
  const cookies = await snapshotCookies();
  await Promise.all(
    cookies.map((c) => chrome.cookies.remove({ url: cookieUrl(c), name: c.name }))
  );
}

export async function restoreCookies(cookies: Cookie[]): Promise<void> {
  const now = Date.now() / 1000;
  for (const c of cookies) {
    if (!c.session && c.expirationDate && c.expirationDate < now) continue;
    const details: chrome.cookies.SetDetails = {
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
