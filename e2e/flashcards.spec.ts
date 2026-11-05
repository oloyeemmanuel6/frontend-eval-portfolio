import { expect, test } from "@playwright/test"

test("flips and moves the synthetic deck from the keyboard", async ({ page }) => {
  await page.goto("/samples/flashcards")
  await expect(page.getByText("Synthetic practice cards. Not a student’s deck.")).toBeVisible()
  const card = page.getByRole("group", { name: "Card 1, Front" })
  await expect(card).toContainText("Standard Nigerian English: next tomorrow")
  await expect(card).toContainText("Card 1 of 4")
  await expect(page.getByRole("button", { name: "Previous" })).toBeDisabled()

  await card.focus()
  await page.keyboard.press("Space")
  await expect(page.getByRole("group", { name: "Card 1, Back" })).toContainText("day after tomorrow")

  await page.keyboard.press("ArrowRight")
  const second = page.getByRole("group", { name: "Card 2, Front" })
  await expect(second).toContainText("I was play football every Friday")
  await page.keyboard.press("ArrowLeft")
  await expect(page.getByRole("group", { name: "Card 1, Front" })).toBeVisible()

  await page.getByRole("button", { name: "Next" }).click()
  await page.getByRole("button", { name: "Next" }).click()
  await page.getByRole("button", { name: "Next" }).click()
  await expect(page.getByRole("group", { name: "Card 4, Front" })).toContainText("I already ate")
  await expect(page.getByRole("button", { name: "Next" })).toBeDisabled()
  await page.keyboard.press("ArrowRight")
  await expect(page.getByRole("group", { name: "Card 4, Front" })).toBeVisible()
})

test("reduced motion drops the card transition", async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  await page.goto("/samples/flashcards")
  const duration = await page.locator(".card-face").evaluate((element) => getComputedStyle(element).transitionDuration)
  expect(duration).toBe("0s")
  await page.getByRole("button", { name: "Flip" }).click()
  await expect(page.getByRole("group", { name: "Card 1, Back" })).toBeVisible()
  await context.close()
})
