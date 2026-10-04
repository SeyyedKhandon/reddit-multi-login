const list = document.getElementById("list");
const empty = document.getElementById("empty");
const errorEl = document.getElementById("error");

const send = (msg) => chrome.runtime.sendMessage(msg);

function showError(msg) {
  errorEl.hidden = !msg;
  errorEl.textContent = msg || "";
}

function render({ current, accounts }) {
  list.replaceChildren();
  empty.hidden = accounts.length > 0;
  for (const acc of accounts) {
    const li = document.createElement("li");
    li.className = acc.name === current ? "current" : "";

    const img = Object.assign(document.createElement("img"), { className: "avatar", src: acc.icon || "", alt: "" });
    const name = Object.assign(document.createElement("span"), {
      className: "name",
      textContent: `u/${acc.name}${acc.name === current ? " ✓" : ""}`,
    });
    const remove = Object.assign(document.createElement("button"), {
      className: "remove",
      textContent: "×",
      title: "Forget this account",
    });

    remove.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!confirm(`Forget u/${acc.name}? This only removes it from this extension.`)) return;
      render(await send({ type: "remove", name: acc.name }));
    });
    li.addEventListener("click", async () => {
      if (acc.name === current) return;
      showError("");
      li.textContent = "Switching…";
      const res = await send({ type: "switch", name: acc.name });
      if (res?.error) {
        showError(res.error);
        render(res.accounts ? res : await send({ type: "state" }));
      } else {
        window.close();
      }
    });

    li.append(img, name, remove);
    list.append(li);
  }
}

document.getElementById("add").addEventListener("click", async () => {
  await send({ type: "add" });
  window.close();
});

// "sync" also captures the current login if it isn't saved yet.
send({ type: "sync" }).then(render);
