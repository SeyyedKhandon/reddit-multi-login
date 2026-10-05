import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) => JSON.parse(readFileSync(resolve(__dirname, "..", p), "utf8"));
const manifest = read("public/manifest.json");

describe("manifest", () => {
  it("has the same version as package.json", () => {
    expect(manifest.version).toBe(read("package.json").version);
  });

  it("asks for no more than cookies + storage on reddit.com", () => {
    expect(manifest.permissions.sort()).toEqual(["cookies", "storage"]);
    expect(manifest.host_permissions).toEqual(["https://*.reddit.com/*"]);
  });

  it("only references icons that exist", () => {
    for (const icon of Object.values<string>(manifest.icons)) {
      expect(existsSync(resolve(__dirname, "../public", icon)), icon).toBe(true);
    }
  });
});
