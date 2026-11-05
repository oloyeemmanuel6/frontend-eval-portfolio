import { expect, test, type Page } from "@playwright/test"

test("shows recorded denominators and does not invent a full-run mean", async ({ page }) => {
  await page.goto("/results")
  await expect(page.getByRole("heading", { name: "Free-tier results, denominators visible" })).toBeVisible()
  await expect(page.getByText("0.909").first()).toBeVisible()
  await expect(page.getByText("0.855").first()).toBeVisible()
  await expect(page.getByText("0.604").first()).toBeVisible()
  await expect(page.getByText("7/9").first()).toBeVisible()
  await expect(page.getByText("6/10").first()).toBeVisible()
  await expect(page.getByText("1/4").first()).toBeVisible()
  await expect(page.locator("body")).not.toContainText("0.818")
  await expect(page.getByText("Partial run").first()).toBeVisible()
  await expect(page.getByRole("img", { name: /Mean score and pass rate/ })).toBeVisible()
})

async function openCell(page: Page, name: string) {
  const button = page.getByRole("button", { name })
  await button.evaluate((element) => element.scrollIntoView({ block: "center", inline: "nearest" }))
  await button.click()
}

test("drilldown keeps missing and pending trials out of a finished score", async ({ page }) => {
  await page.goto("/results")
  const panel = page.locator("#criterion-drilldown")
  await openCell(page, "Gemma 4 31B, T07, Missing, HTTP 429")
  await expect(panel).toContainText("429")
  await expect(panel).toContainText("outside")
  await expect(panel).toContainText("no parseable JSON")

  await openCell(page, "Xing 4.0, T04, Pending, judge incomplete")
  await expect(panel).toContainText("incomplete")
  await expect(panel).toContainText("PENDING")

  await openCell(page, "Dots 3 Note, T01, Fail")
  await expect(panel).toContainText("PARTIAL")
  await expect(panel).toContainText("NIGERIAN_ENGLISH")
  await expect(panel).toContainText("severally")
})
