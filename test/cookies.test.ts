import { beforeEach, describe, expect, it } from "vitest";
import { clearCookies, cookieUrl, restoreCookies } from "../src/background/cookies";
import { installFakeBrowser, makeCookie, type FakeBrowser } from "./helpers/fake-chrome";

let fake: FakeBrowser;
beforeEach(() => void (fake = installFakeBrowser()));

describe("cookieUrl", () => {
  it("drops the leading dot of domain cookies", () => {
    expect(cookieUrl({ domain: ".reddit.com", path: "/" })).toBe("https://reddit.com/");
  });
  it("keeps host-only domains and the path", () => {
    expect(cookieUrl({ domain: "www.reddit.com", path: "/r/x" })).toBe("https://www.reddit.com/r/x");
  });
});

describe("clearCookies", () => {
  it("removes every reddit.com cookie, domain and host-only alike", async () => {
    fake.jar = [
      makeCookie({ name: "a", value: "1" }),
      makeCookie({ name: "b", value: "2", domain: "www.reddit.com", hostOnly: true }),
    ];
    await clearCookies();
    expect(fake.jar).toEqual([]);
  });
});

describe("restoreCookies", () => {
  it("skips persistent cookies that have already expired", async () => {
    await restoreCookies([
      makeCookie({ name: "old", value: "x", expirationDate: Date.now() / 1000 - 10 }),
      makeCookie({ name: "fresh", value: "y" }),
    ]);
    expect(fake.jar.map((c) => c.name)).toEqual(["fresh"]);
  });

  it("keeps session cookies, which have no expiry", async () => {
    await restoreCookies([makeCookie({ name: "s", value: "1", session: true, expirationDate: undefined })]);
    expect(fake.jar).toHaveLength(1);
    expect(fake.jar[0]?.session).toBe(true);
  });

  it("only sets an explicit domain for non host-only cookies", async () => {
    await restoreCookies([
      makeCookie({ name: "wide", value: "1" }),
      makeCookie({ name: "narrow", value: "2", domain: "www.reddit.com", hostOnly: true }),
    ]);
    const wide = fake.jar.find((c) => c.name === "wide");
    const narrow = fake.jar.find((c) => c.name === "narrow");
    expect(wide?.hostOnly).toBe(false);
    expect(narrow?.hostOnly).toBe(true);
  });

  it("keeps going when one cookie cannot be set", async () => {
    (chrome.cookies.set as unknown as { mockImplementationOnce(f: () => never): void }).mockImplementationOnce(() => {
      throw new Error("rejected");
    });
    await restoreCookies([makeCookie({ name: "bad", value: "1" }), makeCookie({ name: "good", value: "2" })]);
    expect(fake.jar.map((c) => c.name)).toEqual(["good"]);
  });
});
