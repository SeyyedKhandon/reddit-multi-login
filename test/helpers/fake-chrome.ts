// A tiny in-memory stand-in for the parts of `chrome.*` and Reddit that the
// extension touches, so the background logic can be exercised without a browser.
import { vi } from "vitest";

type Cookie = chrome.cookies.Cookie;

export function makeCookie(over: Partial<Cookie> & Pick<Cookie, "name" | "value">): Cookie {
  return {
    domain: ".reddit.com",
    path: "/",
    secure: true,
    httpOnly: false,
    hostOnly: false,
    sameSite: "no_restriction",
    session: false,
    expirationDate: Date.now() / 1000 + 86_400,
    storeId: "0",
    ...over,
  };
}

const hostOf = (url: string) => new URL(url).hostname;

export interface FakeBrowser {
  jar: Cookie[];
  storage: Record<string, unknown>;
  tabs: { id: number; url: string }[];
  reloaded: number[];
  created: string[];
  updated: { id: number; url: string }[];
  /** Sessions Reddit has revoked server-side: their cookie still exists but no longer logs in. */
  revoked: Set<string>;
  loginAs(name: string): void;
  loggedInName(): string | null;
}

export function installFakeBrowser(): FakeBrowser {
  const fake: FakeBrowser = {
    jar: [],
    storage: {},
    tabs: [],
    reloaded: [],
    created: [],
    updated: [],
    revoked: new Set(),
    loginAs(name) {
      fake.jar = fake.jar.filter((c) => c.name !== "session");
      fake.jar.push(makeCookie({ name: "session", value: name }));
    },
    loggedInName() {
      const c = fake.jar.find((c) => c.name === "session");
      return c && !fake.revoked.has(c.value) ? c.value : null;
    },
  };

  const chromeStub = {
    cookies: {
      getAll: vi.fn(async ({ domain }: { domain: string }) =>
        fake.jar.filter((c) => c.domain.replace(/^\./, "").endsWith(domain))
      ),
      remove: vi.fn(async ({ url, name }: { url: string; name: string }) => {
        const host = hostOf(url);
        fake.jar = fake.jar.filter(
          (c) => !(c.name === name && c.domain.replace(/^\./, "") === host)
        );
      }),
      set: vi.fn(async (d: chrome.cookies.SetDetails) => {
        const host = d.domain ?? hostOf(d.url);
        fake.jar = fake.jar.filter((c) => !(c.name === d.name && c.domain === host));
        fake.jar.push(
          makeCookie({
            name: d.name!,
            value: d.value!,
            domain: host,
            hostOnly: d.domain === undefined,
            session: d.expirationDate === undefined,
            expirationDate: d.expirationDate,
            path: d.path ?? "/",
          })
        );
      }),
    },
    storage: {
      local: {
        get: vi.fn(async (key: string) => (key in fake.storage ? { [key]: fake.storage[key] } : {})),
        set: vi.fn(async (items: Record<string, unknown>) => {
          Object.assign(fake.storage, structuredClone(items));
        }),
      },
    },
    tabs: {
      query: vi.fn(async (q: { url?: string; active?: boolean }) =>
        q.url ? fake.tabs : fake.tabs.slice(0, 1)
      ),
      reload: vi.fn(async (id: number) => void fake.reloaded.push(id)),
      update: vi.fn(async (id: number, p: { url: string }) => void fake.updated.push({ id, url: p.url })),
      create: vi.fn(async (p: { url: string }) => void fake.created.push(p.url)),
    },
  };
  vi.stubGlobal("chrome", chromeStub);

  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      const name = fake.loggedInName();
      if (!name) return new Response("{}", { status: 403 });
      return Response.json({ data: { name, icon_img: `https://img.test/${name}.png?width=256` } });
    })
  );

  return fake;
}
