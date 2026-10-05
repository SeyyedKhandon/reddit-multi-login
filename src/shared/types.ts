export interface AccountSummary {
  name: string;
  icon: string;
}

/** What is persisted in chrome.storage.local, keyed by account name. */
export interface SavedAccount extends AccountSummary {
  cookies: chrome.cookies.Cookie[];
  savedAt: number;
  addedAt: number;
}

export type SavedAccounts = Record<string, SavedAccount>;

/** What the UI is allowed to see: never the cookies. */
export interface AppState {
  current: string | null;
  accounts: AccountSummary[];
}

export interface Failure {
  error: string;
}
