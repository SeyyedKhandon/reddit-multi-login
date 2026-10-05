// Adds an account switcher next to Reddit's profile menu.
import { send } from "../shared/messages";
import { closePanel, isInsidePanel, isPanelOpen, openPanel } from "./panel";
import { findProfileButton } from "./profile-button";

document.addEventListener(
  "click",
  (e) => {
    const path = e.composedPath();
    if (isInsidePanel(path)) return;
    const button = findProfileButton(path);
    if (button) {
      if (isPanelOpen()) closePanel();
      else void openPanel(button);
    } else {
      closePanel();
    }
  },
  true
);
document.addEventListener("keydown", (e) => e.key === "Escape" && closePanel());

// Keep the saved snapshot fresh and auto-capture newly logged-in accounts.
void send({ type: "sync" });
