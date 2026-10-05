import { el } from "../shared/dom";
import { hasState, isFailure, send } from "../shared/messages";
import type { AppState } from "../shared/types";
import { STYLE } from "./style";

let host: HTMLElement | null = null;

export const isInsidePanel = (path: EventTarget[]): boolean => host !== null && path.includes(host);
export const isPanelOpen = (): boolean => host !== null;

export function closePanel(): void {
  host?.remove();
  host = null;
}

export function render(state: AppState, button: Element, error?: string): void {
  closePanel();
  host = el("div");
  const root = host.attachShadow({ mode: "open" });
  root.append(el("style", { textContent: STYLE }));

  const panel = el("div", { className: "panel" });
  panel.append(el("div", { className: "title", textContent: "Switch account" }));

  for (const acc of state.accounts) {
    const isCurrent = acc.name === state.current;
    const item = el("button", { className: "item", disabled: isCurrent });
    item.append(
      el("img", { className: "avatar", src: acc.icon || "", alt: "" }),
      el("span", { className: "name", textContent: `u/${acc.name}` }),
      el("span", { className: "check", textContent: isCurrent ? "✓" : "" })
    );
    item.addEventListener("click", async () => {
      item.textContent = "Switching…";
      const res = await send({ type: "switch", name: acc.name });
      if (isFailure(res)) render(hasState(res) ? res : state, button, res.error);
      // On success the background reloads this tab.
    });
    panel.append(item);
  }

  panel.append(el("div", { className: "sep" }));
  const add = el("button", { className: "item", textContent: "＋ Add another account" });
  add.addEventListener("click", () => void send({ type: "add" }));
  panel.append(add);
  if (error) panel.append(el("div", { className: "error", textContent: error }));

  // Sit just to the left of Reddit's dropdown, aligned with the avatar button.
  const rect = button.getBoundingClientRect();
  panel.style.top = `${rect.bottom + 8}px`;
  panel.style.right = `${window.innerWidth - rect.right + 270}px`;

  root.append(panel);
  document.documentElement.append(host);
}

export async function openPanel(button: Element): Promise<void> {
  const state = await send({ type: "sync" });
  if (isFailure(state) || !state.current) return;
  render(state, button);
}
