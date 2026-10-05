import { expect, test } from "./fixtures";

test("saves each account it sees and switches between them from Reddit's profile menu", async ({
  context,
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
  await expect(page.locator("#who")).toHaveText("bob");

  await page.locator("#expand-user-drawer-button").click();
  const items = page.locator(".panel .item");
  await expect(items.filter({ hasText: "u/bob" })).toBeDisabled();
  await items.filter({ hasText: "u/alice" }).click();

  // The background swaps the cookies and reloads the tab.
  await expect(page.locator("#who")).toHaveText("alice");
});

test("pressing Escape closes the menu", async ({ context, loginAs, savedAccounts }) => {
  const page = await context.newPage();
  await loginAs("alice");
  await page.goto("https://www.reddit.com/");
  await expect.poll(savedAccounts).toEqual(["alice"]);

  await page.locator("#expand-user-drawer-button").click();
  await expect(page.locator(".panel")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".panel")).toHaveCount(0);
});

test("'Add another account' saves the current one and lands on the login page logged out", async ({
  context,
  loginAs,
  savedAccounts,
}) => {
  const page = await context.newPage();
  await loginAs("alice");
  await page.goto("https://www.reddit.com/");
  await expect.poll(savedAccounts).toEqual(["alice"]);

  await page.locator("#expand-user-drawer-button").click();
  await page.locator(".panel .item", { hasText: "Add another account" }).click();

  await expect(page.locator("#login")).toBeVisible();
  expect((await context.cookies()).filter((c) => c.name === "session")).toEqual([]);
  expect(await savedAccounts()).toEqual(["alice"]);
});

test("tells the user when a saved session has expired", async ({ context, reddit, loginAs, savedAccounts }) => {
  const page = await context.newPage();
  await loginAs("alice");
  await page.goto("https://www.reddit.com/");
  await expect.poll(savedAccounts).toEqual(["alice"]);
  await loginAs("bob");
  await page.goto("https://www.reddit.com/");
  await expect.poll(savedAccounts).toEqual(["alice", "bob"]);

  reddit.revoked.add("alice"); // e.g. the user hit "Log out" on Reddit
  await page.locator("#expand-user-drawer-button").click();
  await page.locator(".panel .item", { hasText: "u/alice" }).click();

  await expect(page.locator("#who")).toHaveText("logged out");
});
