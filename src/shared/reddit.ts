export const REDDIT_DOMAIN = "reddit.com";
export const REDDIT_TABS = "https://*.reddit.com/*";
export const ME_URL = "https://www.reddit.com/api/me.json";
export const LOGIN_URL = "https://www.reddit.com/login/";

export const isRedditUrl = (url: string | undefined): boolean =>
  /^https:\/\/([^/]*\.)?reddit\.com\//.test(url ?? "");
