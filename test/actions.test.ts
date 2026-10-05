import { beforeEach, describe, expect, it } from "vitest";
import { getAccounts } from "../src/background/accounts";
import { addAccount, removeAccount, switchTo, sync } from "../src/background/actions";
import { handlers, onMessage } from "../src/background/router";
import { installFakeBrowser, type FakeBrowser } from "./helpers/fake-chrome";

let fake: FakeBrowser;
beforeEach(() => {
  fake = installFakeBrowser();
  fake.tabs = [{ id: 7, url: "https://www.reddit.com/" }];
});

describe("sync", () => {
  it("reports no current account when logged out", async () => {
    expect(await sync()).toEqual({ current: null, accounts: [] });
  });

  it("auto-saves whoever is logged in, with a clean avatar URL", async () => {
    fake.loginAs("alice");
    expect(await sync()).toEqual({
      current: "alice",
      accounts: [{ name: "alice", icon: "https://img.test/alice.png" }],
    });
    expect((await getAccounts())["alice"]?.cookies).toHaveLength(1);
  });

  it("keeps the original addedAt (and therefore the list order) on re-sync", async () => {
    fake.loginAs("alice");
    await sync();
    const first = (await getAccounts())["alice"]!.addedAt;
    await sync();
    expect((await getAccounts())["alice"]!.addedAt).toBe(first);
  });

  it("lists accounts in the order they were added", async () => {
    fake.loginAs("alice");
    await sync();
    fake.loginAs("bob");
    const state = await sync();
    expect(state.accounts.map((a) => a.name)).toEqual(["alice", "bob"]);
    expect(state.current).toBe("bob");
  });

  it("never exposes cookies to the UI", async () => {
    fake.loginAs("alice");
    const state = await sync();
    expect(JSON.stringify(state)).not.toContain("cookies");
  });
});

describe("switchTo", () => {
  beforeEach(async () => {
    fake.loginAs("alice");
    await sync();
    fake.loginAs("bob");
    await sync();
  });

  it("rejects an account that was never saved", async () => {
    expect(await switchTo("mallory")).toEqual({ error: "Unknown account" });
  });

  it("swaps the cookies, reloads reddit tabs and reports the new current account", async () => {
    const result = await switchTo("alice");
    expect(result).toMatchObject({ current: "alice" });
    expect(fake.loggedInName()).toBe("alice");
    expect(fake.reloaded).toEqual([7]);
  });

  it("does nothing when asked to switch to the current account", async () => {
    const result = await switchTo("bob");
    expect(result).toMatchObject({ current: "bob" });
    expect(fake.reloaded).toEqual([]);
  });

  it("reports an expired session, logs out, and still returns the account list", async () => {
    fake.revoked.add("alice");
    const result = await switchTo("alice");
    expect(result).toMatchObject({
      error: expect.stringContaining("u/alice has expired"),
      current: null,
      accounts: [{ name: "alice" }, { name: "bob" }],
    });
    expect(fake.jar).toEqual([]);
  });
});

describe("addAccount", () => {
  it("saves the current account, clears cookies and sends the active reddit tab to the login page", async () => {
    fake.loginAs("alice");
    await addAccount();
    expect(Object.keys(await getAccounts())).toEqual(["alice"]);
    expect(fake.jar).toEqual([]);
    expect(fake.updated).toEqual([{ id: 7, url: "https://www.reddit.com/login/" }]);
  });

  it("opens a new tab when the active tab is not on reddit", async () => {
    fake.tabs = [{ id: 3, url: "https://example.com/" }];
    await addAccount();
    expect(fake.created).toEqual(["https://www.reddit.com/login/"]);
  });

  it("does not reload the tab it just navigated", async () => {
    fake.tabs = [
      { id: 7, url: "https://www.reddit.com/" },
      { id: 8, url: "https://old.reddit.com/" },
    ];
    await addAccount();
    expect(fake.reloaded).toEqual([8]);
  });
});

describe("removeAccount", () => {
  it("forgets the account without logging out", async () => {
    fake.loginAs("alice");
    await sync();
    const state = await removeAccount("alice");
    expect(state).toEqual({ current: "alice", accounts: [] });
    expect(fake.loggedInName()).toBe("alice");
  });
});

describe("message router", () => {
  const dispatch = (msg: unknown) =>
    new Promise<unknown>((resolve) => {
      const async = onMessage(msg, {}, resolve);
      if (!async) resolve("ignored");
    });

  it("ignores unknown and malformed messages", async () => {
    expect(await dispatch({ type: "constructor" })).toBe("ignored");
    expect(await dispatch({ type: "nope" })).toBe("ignored");
    expect(await dispatch(undefined)).toBe("ignored");
  });

  it("answers known messages asynchronously", async () => {
    fake.loginAs("alice");
    expect(await dispatch({ type: "state" })).toMatchObject({ current: "alice" });
  });

  it("turns a thrown error into an error reply", async () => {
    const original = handlers.state;
    handlers.state = async () => {
      throw new Error("boom");
    };
    try {
      expect(await dispatch({ type: "state" })).toEqual({ error: "Error: boom" });
    } finally {
      handlers.state = original;
    }
  });
});
