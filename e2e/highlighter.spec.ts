import { expect, test } from "@playwright/test"

test("canvas underline has a text equivalent and keyboard samples", async ({ page }) => {
  await page.goto("/samples/error-highlighter")
  await expect(page.getByText("Synthetic sentences written for this demo. Not a real student’s writing.")).toBeVisible()
  const equivalent = page.getByRole("region", { name: "Text equivalent" })
  await expect(equivalent.locator("mark")).toHaveText("was play")
  await expect(equivalent).toContainText("used to play")

  const canvas = page.locator("canvas")
  await expect(canvas).toHaveAttribute("aria-hidden", "true")
  await expect.poll(async () => (await canvas.boundingBox())?.width ?? 0).toBeGreaterThan(50)

  const list = page.getByRole("listbox", { name: "Synthetic sample sentences" })
  await list.focus()
  await page.keyboard.press("ArrowDown")
  await expect(equivalent.locator("mark").nth(0)).toHaveText("She go")
  await expect(equivalent.locator("mark").nth(1)).toHaveText("buy")
  await expect(equivalent.getByRole("listitem")).toHaveCount(2)

  await page.keyboard.press("End")
  await expect(equivalent.locator("mark")).toHaveText("am living")
  await page.keyboard.press("Home")
  await expect(equivalent.locator("mark")).toHaveText("was play")
})
