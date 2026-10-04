// Adds an account switcher next to Reddit's profile menu.

const PROFILE_BUTTON_SELECTORS = [
  "#expand-user-drawer-button",
  'button[aria-label*="profile" i]',
  'button[aria-label*="user menu" i]',
  'button[aria-label*="open user" i]',
];

const STYLE = `
  :host { all: initial; }
  .panel {
    position: fixed; z-index: 2147483647; width: 240px; max-height: 70vh; overflow: auto;
    box-sizing: border-box; padding: 6px 0; border-radius: 8px; font: 14px/1.3 system-ui, sans-serif;
    background: #fff; color: #1c1c1c; border: 1px solid #edeff1; box-shadow: 0 4px 16px rgba(0,0,0,.25);
  }
  @media (prefers-color-scheme: dark) {
    .panel { background: #1a1a1b; color: #d7dadc; border-color: #343536; }
    .item:hover { background: #272729; }
  }
  .title { padding: 6px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; opacity: .6; }
  .item {
    display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 16px; border: 0;
    background: none; color: inherit; font: inherit; text-align: left; cursor: pointer;
  }
  .item:hover { background: #f6f7f8; }
  .item[disabled] { cursor: default; opacity: .7; }
  .avatar { width: 24px; height: 24px; border-radius: 50%; background: #ff4500; flex: none; object-fit: cover; }
  .name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .check { color: #0079d3; }
  .sep { height: 1px; margin: 4px 0; background: #edeff1; }
  .error { padding: 8px 16px; color: #ea0027; font-size: 12px; }
  @media (prefers-color-scheme: dark) { .sep { background: #343536; } }
`;

let host = null;
let root = null;
let current = null;

const send = (msg) => chrome.runtime.sendMessage(msg);

function findProfileButton(path) {
  for (const el of path) {
    if (!(el instanceof Element)) continue;
    if (PROFILE_BUTTON_SELECTORS.some((s) => el.matches(s))) return el;
  }
  return null;
}

function closePanel() {
  host?.remove();
  host = root = null;
}

function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

function render(state, button, error) {
  closePanel();
  host = el("div");
  root = host.attachShadow({ mode: "open" });
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
      if (res?.error) render({ ...state, ...res }, button, res.error);
      // On success the background reloads this tab.
    });
    panel.append(item);
  }

  panel.append(el("div", { className: "sep" }));
  const add = el("button", { className: "item", textContent: "＋ Add another account" });
  add.addEventListener("click", () => send({ type: "add" }));
  panel.append(add);
  if (error) panel.append(el("div", { className: "error", textContent: error }));

  // Sit just to the left of Reddit's dropdown, aligned with the avatar button.
  const rect = button.getBoundingClientRect();
  panel.style.top = `${rect.bottom + 8}px`;
  panel.style.right = `${window.innerWidth - rect.right + 270}px`;

  root.append(panel);
  document.documentElement.append(host);
}

async function openPanel(button) {
  const state = await send({ type: "sync" });
  if (!state || !state.current) return;
  current = state.current;
  render(state, button);
}

document.addEventListener(
  "click",
  (e) => {
    const path = e.composedPath();
    if (host && path.includes(host)) return;
    const button = findProfileButton(path);
    if (button) {
      if (host) closePanel();
      else openPanel(button);
    } else {
      closePanel();
    }
  },
  true
);
document.addEventListener("keydown", (e) => e.key === "Escape" && closePanel());

// Keep the saved snapshot fresh and auto-capture newly logged-in accounts.
send({ type: "sync" });
