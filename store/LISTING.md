# Chrome Web Store listing – Account Switcher for Reddit

Upload: `release/account-switcher-for-reddit-1.0.0.zip` (run `npm run package`).

## Store listing → Product details

**Title from package**
Account Switcher for Reddit

**Summary from package** (from `manifest.json`, max 132 chars)
Switch between multiple Reddit accounts right from the profile menu, like the mobile app. No tracking, open source.

**Description**
```
Reddit's mobile app lets you switch accounts in one tap. The website doesn't. Account Switcher for Reddit brings the same simple experience to your browser: click your profile icon, pick another account, and you're there.

HOW IT WORKS
• Log in to Reddit as usual – the account is saved automatically.
• Click your profile icon and choose any saved account from the "Switch account" list.
• Click "Add another account" to log in with a second (or third…) account. It is saved automatically too.
• You can also switch from the toolbar icon, and forget any account with one click.

WHY YOU'LL LIKE IT
✓ Simple and fast – as easy as the mobile app.
✓ No tracking – no analytics, no telemetry, no ads, no server. Nothing leaves your browser.
✓ No passwords saved – you log in on Reddit's own page; the extension never sees or stores your password.
✓ Open source (MIT) – small, readable code you can inspect, fork and improve.
✓ Minimal permissions – only cookies and storage, and only for reddit.com.

GOOD TO KNOW
• Only one account is active at a time (just like Reddit itself). Switching reloads your open Reddit tabs.
• Saved sessions stay on your device in local extension storage and are never synced or uploaded. Don't use the extension on a shared browser profile.
• If you use Reddit's own "Log out" button, that account's saved session expires – just log in again.

Source code & issues: https://github.com/SeyyedKhandon/reddit-multi-login
Support: support.mhdi@gmail.com

Account Switcher for Reddit is an independent open-source project. It is not affiliated with, endorsed by or sponsored by Reddit, Inc. "Reddit" is a trademark of Reddit, Inc.
```

**Category:** Social & Communication
**Language:** English (United States)

## Graphic assets
| Field | File |
|---|---|
| Store icon (128×128) | `store/icon-128.png` |
| Screenshot 1 (1280×800) | `store/screenshot-1-profile-menu.png` |
| Screenshot 2 | `store/screenshot-2-add-account.png` |
| Screenshot 3 | `store/screenshot-3-toolbar-popup.png` |
| Screenshot 4 | `store/screenshot-4-private-and-simple.png` |
| Small promo tile (440×280) | `store/promo-small-440x280.png` |
| Marquee promo tile (1400×560) | `store/promo-marquee-1400x560.png` |
| Global promo video | https://www.youtube.com/watch?v=DZk6LELndAc |

All images are 24-bit PNG without alpha.

**YouTube title:** Account Switcher for Reddit – switch Reddit accounts on the web like on mobile
**YouTube description:** Reddit's mobile app lets you switch accounts in one tap – the website doesn't. This free, open-source Chrome extension adds a "Switch account" list to your profile menu. No tracking, no passwords saved, MIT licensed. Source: https://github.com/SeyyedKhandon/reddit-multi-login

## Additional fields
- **Homepage URL:** https://github.com/SeyyedKhandon/reddit-multi-login
- **Support URL:** https://github.com/SeyyedKhandon/reddit-multi-login/issues
- **Contact email (Account tab):** support.mhdi@gmail.com
- **Mature content:** No

> The GitHub URLs assume the repository is published as `SeyyedKhandon/reddit-multi-login`. Adjust them if you pick another name.

## Privacy tab

**Single purpose description**
Lets a Reddit user switch between several of their own Reddit accounts from the profile menu or the toolbar popup, like on the mobile app. Nothing else.

**cookies justification**
Reddit's web login is stored in cookies. To switch accounts, the extension saves the reddit.com cookies of an account the user is logged into (kept locally) and later restores them, replacing the current reddit.com cookies. It only touches reddit.com cookies.

**storage justification**
Uses chrome.storage.local to keep the user's saved accounts (username, avatar URL and the reddit.com session cookies) on their device. Nothing is synced or transmitted.

**Host permission justification** (`https://*.reddit.com/*`)
Needed to (1) read and restore the reddit.com cookies, (2) inject the "Switch account" list next to the profile menu on Reddit pages, and (3) ask reddit.com (/api/me.json) which account is currently logged in. No other site is accessed.

**Are you using remote code?** No.

**Data usage – what user data do you collect?**
Tick **Authentication information** only. The extension handles the user's Reddit session cookies, which are authentication data, but they are stored only on the user's device and never transmitted. It does not collect a password. Leave everything else unticked.

**Certifications:** tick all three (data is not sold or transferred, not used for unrelated purposes, not used for creditworthiness or lending).

**Privacy policy URL:** https://github.com/SeyyedKhandon/reddit-multi-login/blob/main/PRIVACY.md
