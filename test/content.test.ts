// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { findProfileButton } from "../src/content/profile-button";

function pathOf(target: Element): EventTarget[] {
  const path: EventTarget[] = [];
  for (let n: Node | null = target; n; n = n.parentNode) path.push(n);
  return path;
}

describe("findProfileButton", () => {
  it("finds Reddit's avatar button by id", () => {
    document.body.innerHTML = `<button id="expand-user-drawer-button"><span id="inner"></span></button>`;
    const found = findProfileButton(pathOf(document.getElementById("inner")!));
    expect(found?.id).toBe("expand-user-drawer-button");
  });

  it.each(["Open user menu", "Profile", "open user drawer"])(
    "falls back to aria-label %s",
    (label) => {
      document.body.innerHTML = `<button aria-label="${label}"><i id="x"></i></button>`;
      expect(findProfileButton(pathOf(document.getElementById("x")!))).not.toBeNull();
    }
  );

  it("ignores unrelated clicks", () => {
    document.body.innerHTML = `<button aria-label="Upvote"><i id="x"></i></button>`;
    expect(findProfileButton(pathOf(document.getElementById("x")!))).toBeNull();
  });
});
