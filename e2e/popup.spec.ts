import { expect, test } from "./fixtures";

test("shows the empty state when nobody is logged in", async ({ context, extensionId }) => {
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup/index.html`);
  await expect(popup.locator("#empty")).toBeVisible();
  await expect(popup.locator("#list li")).toHaveCount(0);
});

test("lists saved accounts, marks the current one and can forget another", async ({
  context,
  extensionId,
  loginAs,
  savedAccounts,
}) => {
  const page = await context.newPage();
  await loginAs("alice");
  await page.goto("https://www.reddit.com/");
  await expect.poll(savedAccounts).toEqual(["alice"]);
  await loginAs("bob");
  await page.goto("https://www.reddit.com/");
  await expect.poll(savedAccounts).toEqual(["alice", "bob"]);

  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup/index.html`);
  await expect(popup.locator("#list li")).toHaveText(["u/alice×", "u/bob ✓×"]);
  await expect(popup.locator("li.current")).toContainText("u/bob");

  popup.once("dialog", (d) => void d.accept());
  await popup.locator("li", { hasText: "u/alice" }).locator(".remove").click();
  await expect(popup.locator("#list li")).toHaveCount(1);
  expect(await savedAccounts()).toEqual(["bob"]);
});

test("switches account from the toolbar popup", async ({ context, extensionId, loginAs, savedAccounts }) => {
  const page = await context.newPage();
  await loginAs("alice");
  await page.goto("https://www.reddit.com/");
  await expect.poll(savedAccounts).toEqual(["alice"]);
  await loginAs("bob");
  await page.goto("https://www.reddit.com/");
  await expect.poll(savedAccounts).toEqual(["alice", "bob"]);

  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup/index.html`);
  await popup.locator("li", { hasText: "u/alice" }).click();

  await expect(page.locator("#who")).toHaveText("alice");
});
