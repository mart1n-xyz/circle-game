import { test, expect } from "@playwright/test";
test("play a funded turn, inspect accounts and ledger, then resume after reload", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "A new month. A little possibility." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "How to play" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page
    .getByRole("spinbutton", { name: "Monthly circle contribution" })
    .fill("100");
  await page.getByRole("button", { name: "Confirm my budget" }).click();
  await page
    .getByRole("button", { name: "Explore opportunity" })
    .first()
    .click();
  await page
    .getByRole("spinbutton", { name: "Exact loan amount" })
    .fill("1200");
  await page.getByRole("button", { name: "Choose this opportunity" }).click();
  await expect(page.getByText("Your plan is ready.")).toBeVisible();
  await page
    .getByRole("button", { name: "Take my plan to the circle" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Around the table" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close backing & vote" }).click();
  for (const vote of await page
    .getByRole("button", { name: "Yes", exact: true })
    .all())
    await vote.click();
  await page.getByRole("button", { name: "Settle the month" }).click();
  await expect(
    page.getByRole("heading", { name: "Here’s how the month landed." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "My portfolio" }).click();
  await expect(
    page.getByRole("heading", { name: "Your portfolio", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Circle ledger", exact: true })
    .click();
  await expect(page.getByText("Balanced", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Standings", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "The season standings" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open month 2" }).click();
  await page.reload();
  await expect(
    page.getByText("Month 2", { exact: false }).first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Manage accounts & repayments" })
    .click();
  await page
    .getByRole("spinbutton", { name: "Savings withdrawal amount" })
    .fill("100");
  await page.getByRole("button", { name: "Request withdrawal" }).click();
  await expect(
    page.getByText("100.00 cr is in your withdrawal queue."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("keyboard dialogs, an abstained turn and a new seed work", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "View Mara’s membership" }).click();
  await expect(
    page.getByRole("heading", { name: "Mara at the table" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Confirm my budget" }).click();
  await page.getByRole("button", { name: "Pass & meet the circle" }).click();
  await page.getByRole("button", { name: "Close backing & vote" }).click();
  for (const vote of await page
    .getByRole("button", { name: "Abstain", exact: true })
    .all())
    await vote.click();
  await page.getByRole("button", { name: "Settle the month" }).click();
  await page.getByRole("button", { name: "New table" }).click();
  await page.getByLabel("Table seed").fill("browser-replay");
  await page.getByRole("button", { name: "Start new season" }).click();
  await expect(
    page.getByText("Local practice · seed browser-replay · rules 0.1"),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("circle-table-v1")!).round,
    ),
  ).toBe(1);
});

test("a complete season reaches settled final standings through the visible controls", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto("/");
  for (let month = 1; month <= 24; month++) {
    await page.getByRole("button", { name: "Confirm my budget" }).click();
    await page.getByRole("button", { name: "Pass & meet the circle" }).click();
    await page.getByRole("button", { name: "Close backing & vote" }).click();
    for (const vote of await page
      .getByRole("button", { name: "Yes", exact: true })
      .all())
      await vote.click();
    await page.getByRole("button", { name: "Settle the month" }).click();
    if (month < 24)
      await page
        .getByRole("button", { name: "Open month " + (month + 1), exact: true })
        .click();
  }
  await page
    .getByRole("button", { name: "Finish all remaining months" })
    .click();
  await expect(page.getByText("You’ve come full circle.")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "A season of shared possibility." }),
  ).toBeVisible();
  const state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("circle-table-v1")!),
  );
  expect(state.round).toBe(31);
  expect(state.phase).toBe("finished");
  expect(
    state.projects.every((p: { status: string }) => p.status !== "running"),
  ).toBe(true);
  await page.reload();
  await expect(page.getByText("You’ve come full circle.")).toBeVisible();
});
