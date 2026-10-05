import { el } from "../shared/dom";
import { hasState, isFailure, send } from "../shared/messages";
import type { AppState } from "../shared/types";
import "./popup.css";

function byId<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`#${id} missing from popup.html`);
  return node as T;
}

const list = byId<HTMLUListElement>("list");
const empty = byId("empty");
const errorEl = byId("error");

function showError(msg: string): void {
  errorEl.hidden = !msg;
  errorEl.textContent = msg;
}

/** Draw a state reply, or show why we could not get one. */
function renderReply(reply: AppState | { error: string }): void {
  if (isFailure(reply) && !hasState(reply)) showError(reply.error);
  else render(reply as AppState);
}

function render({ current, accounts }: AppState): void {
  list.replaceChildren();
  empty.hidden = accounts.length > 0;
  for (const acc of accounts) {
    const isCurrent = acc.name === current;
    const remove = el("button", {
      className: "remove",
      textContent: "×",
      title: "Forget this account",
    });
    const li = el(
      "li",
      { className: isCurrent ? "current" : "" },
      el("img", { className: "avatar", src: acc.icon || "", alt: "" }),
      el("span", { className: "name", textContent: `u/${acc.name}${isCurrent ? " ✓" : ""}` }),
      remove
    );

    remove.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!confirm(`Forget u/${acc.name}? This only removes it from this extension.`)) return;
      renderReply(await send({ type: "remove", name: acc.name }));
    });
    li.addEventListener("click", async () => {
      if (isCurrent) return;
      showError("");
      li.textContent = "Switching…";
      const res = await send({ type: "switch", name: acc.name });
      if (isFailure(res)) {
        showError(res.error);
        renderReply(hasState(res) ? res : await send({ type: "state" }));
      } else {
        window.close();
      }
    });

    list.append(li);
  }
}

byId("add").addEventListener("click", async () => {
  await send({ type: "add" });
  window.close();
});

// "sync" also captures the current login if it isn't saved yet.
send({ type: "sync" }).then(renderReply);
