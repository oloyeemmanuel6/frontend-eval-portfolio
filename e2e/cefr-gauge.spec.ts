import { expect, test } from "@playwright/test"

test("moves through the six CEFR levels from the keyboard and the buttons", async ({ page }) => {
  await page.goto("/samples/cefr-gauge")
  const slider = page.getByRole("slider", { name: "Sample CEFR level" })
  await expect(slider).toHaveAttribute("aria-valuemin", "0")
  await expect(slider).toHaveAttribute("aria-valuemax", "5")
  await expect(slider).toHaveAttribute("aria-valuenow", "1")
  await expect(slider).toHaveAttribute("aria-valuetext", /A2/)
  await expect(page.locator(".sample-flag")).toHaveText("Sample control. Not a learner record.")
  for (const code of ["A1", "A2", "B1", "B2", "C1", "C2"]) {
    await expect(page.getByRole("button", { name: code, exact: true })).toBeVisible()
  }
  await slider.focus()
  await page.keyboard.press("ArrowRight")
  await expect(page.locator(".selected-level")).toContainText("B1")
  await page.keyboard.press("ArrowLeft")
  await page.keyboard.press("ArrowLeft")
  await expect(slider).toHaveAttribute("aria-valuenow", "0")
  await page.keyboard.press("ArrowLeft")
  await expect(slider).toHaveAttribute("aria-valuenow", "0")
  await page.keyboard.press("End")
  await expect(slider).toHaveAttribute("aria-valuetext", /C2/)
  await page.keyboard.press("Home")
  await expect(slider).toHaveAttribute("aria-valuetext", /A1/)
  await page.getByRole("button", { name: "B2", exact: true }).click()
  await expect(page.locator(".selected-level")).toContainText("B2")
  await expect(page.getByRole("link", { name: "Download mockup.svg" })).toBeVisible()
})

test("reduced motion drops the needle transition", async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 1280, height: 800 },
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  await page.goto("/samples/cefr-gauge")
  const duration = await page.locator(".gauge-needle").evaluate((element) => getComputedStyle(element).transitionDuration)
  expect(duration).toBe("0s")
  await page.getByRole("button", { name: "B2", exact: true }).click()
  await expect(page.locator(".selected-level")).toContainText("B2")
  await context.close()
})
