import type { AccountSummary, AppState, SavedAccounts } from "../shared/types";
import { snapshotCookies } from "./cookies";
import { whoAmI } from "./identity";

export async function getAccounts(): Promise<SavedAccounts> {
  const { accounts = {} } = await chrome.storage.local.get<{ accounts?: SavedAccounts }>("accounts");
  return accounts;
}

export async function saveAccount(me: AccountSummary): Promise<void> {
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

export async function forgetAccount(name: string): Promise<void> {
  const accounts = await getAccounts();
  delete accounts[name];
  await chrome.storage.local.set({ accounts });
}

export async function state(me: AccountSummary | null): Promise<AppState> {
  const accounts = await getAccounts();
  const list = Object.values(accounts)
    .sort((a, b) => a.addedAt - b.addedAt)
    .map(({ name, icon }) => ({ name, icon }));
  return { current: me?.name ?? null, accounts: list };
}
