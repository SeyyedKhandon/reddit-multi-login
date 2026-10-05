import { test as base, chromium, expect, type BrowserContext, type Worker } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { startMockReddit, type MockReddit } from "./mock-reddit";

const EXTENSION = resolve(import.meta.dirname, "../dist");

interface Fixtures {
  reddit: MockReddit;
  context: BrowserContext;
  worker: Worker;
  extensionId: string;
  /** Pretend the user logged in to Reddit as `name` in this browser. */
  loginAs(name: string): Promise<void>;
  /** The accounts the extension has saved, by name. */
  savedAccounts(): Promise<string[]>;
}

export const test = base.extend<Fixtures>({
  reddit: async ({}, use) => {
    const reddit = await startMockReddit();
    await use(reddit);
    await reddit.close();
  },

  context: async ({ reddit }, use) => {
    const userDataDir = mkdtempSync(resolve(tmpdir(), "reddit-switcher-"));
    const context = await chromium.launchPersistentContext(userDataDir, {
      channel: "chromium", // the new headless mode, which supports extensions
      args: [
        `--disable-extensions-except=${EXTENSION}`,
        `--load-extension=${EXTENSION}`,
        // Send reddit.com to the local mock, whose certificate is self-signed.
        `--host-resolver-rules=MAP www.reddit.com 127.0.0.1:${reddit.port}`,
        "--ignore-certificate-errors",
      ],
    });
    await use(context);
    await context.close();
    rmSync(userDataDir, { recursive: true, force: true });
  },

  worker: async ({ context }, use) => {
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent("serviceworker"));
    await use(worker);
  },

  extensionId: async ({ worker }, use) => {
    await use(new URL(worker.url()).host);
  },

  loginAs: async ({ context }, use) => {
    await use(async (name) => {
      await context.clearCookies();
      await context.addCookies([
        { name: "session", value: name, domain: ".reddit.com", path: "/", secure: true },
      ]);
    });
  },

  savedAccounts: async ({ worker }, use) => {
    await use(() =>
      worker.evaluate(async () => {
        const { accounts = {} } = await chrome.storage.local.get<{ accounts?: object }>("accounts");
        return Object.keys(accounts);
      })
    );
  },
});

export { expect };
