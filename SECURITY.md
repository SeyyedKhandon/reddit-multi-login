# Security policy

This extension stores logged-in Reddit sessions (cookies) in the browser's local
extension storage, so security reports are taken seriously.

## Reporting a vulnerability

Please email **support.mhdi@gmail.com** with the details instead of opening a
public issue. Include the extension version and steps to reproduce. You will get
a reply as soon as possible, and a fix is released before details are published.

## Scope

In scope: leaking or mixing up saved sessions, any network request other than to
`reddit.com`, permissions beyond `cookies` and `storage`, injected-page content
reaching the extension's own UI.

Out of scope: anyone with access to your unlocked browser profile can read the
saved sessions - that trade-off is documented in [PRIVACY.md](PRIVACY.md).
