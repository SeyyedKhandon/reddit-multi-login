export const PROFILE_BUTTON_SELECTORS = [
  "#expand-user-drawer-button",
  'button[aria-label*="profile" i]',
  'button[aria-label*="user menu" i]',
  'button[aria-label*="open user" i]',
];

/** First element on a click's composed path that looks like Reddit's profile button. */
export function findProfileButton(path: EventTarget[]): Element | null {
  for (const el of path) {
    if (!(el instanceof Element)) continue;
    if (PROFILE_BUTTON_SELECTORS.some((s) => el.matches(s))) return el;
  }
  return null;
}
