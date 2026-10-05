// A stand-in for www.reddit.com: just enough of the site for the extension to
// work against. Whoever's name is in the `session` cookie is "logged in".
import { createServer, type Server } from "node:https";
import type { AddressInfo } from "node:net";
import selfsigned from "selfsigned";

const sessionOf = (cookieHeader = ""): string | null =>
  /(?:^|;\s*)session=([^;]+)/.exec(cookieHeader)?.[1] ?? null;

export interface MockReddit {
  port: number;
  /** Sessions the "server" no longer accepts, even though the cookie is still there. */
  revoked: Set<string>;
  close(): Promise<void>;
}

export async function startMockReddit(): Promise<MockReddit> {
  const pems = await selfsigned.generate([{ name: "commonName", value: "www.reddit.com" }], {
    algorithm: "sha256",
  });
  const revoked = new Set<string>();

  const server: Server = createServer({ key: pems.private, cert: pems.cert }, (req, res) => {
    const session = sessionOf(req.headers.cookie);
    const who = session && !revoked.has(session) ? session : null;
    const path = new URL(req.url ?? "/", "https://www.reddit.com").pathname;

    if (path === "/api/me.json") {
      res.writeHead(who ? 200 : 403, { "content-type": "application/json" });
      res.end(JSON.stringify(who ? { data: { name: who, icon_img: "" } } : {}));
    } else if (path === "/login/") {
      res.writeHead(200, { "content-type": "text/html" });
      res.end(`<h1 id="login">Log in</h1>`);
    } else {
      res.writeHead(200, { "content-type": "text/html" });
      res.end(
        `<p id="who">${who ?? "logged out"}</p>` +
          (who
          ? // Reddit's avatar button lives in the top-right corner; the panel opens to its left.
            `<button id="expand-user-drawer-button" style="position:fixed;top:8px;right:8px">Profile</button>`
          : "")
      );
    }
  });
  await new Promise<void>((ok) => server.listen(0, "127.0.0.1", ok));

  return {
    port: (server.address() as AddressInfo).port,
    revoked,
    close: () => new Promise((ok) => server.close(() => ok())),
  };
}
