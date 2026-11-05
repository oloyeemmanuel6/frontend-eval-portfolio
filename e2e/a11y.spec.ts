import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

const ROUTES = ["/", "/results", "/eval", "/samples", "/samples/cefr-gauge", "/samples/flashcards", "/samples/error-highlighter", "/samples/review", "/about"]

test("skip link is first in the tab order and can take focus", async ({ page }) => {
  await page.goto("/")
  const first = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll<HTMLElement>("a, button, input, select, textarea, [tabindex]")]
    const visible = nodes.filter((node) => {
      if (node.tabIndex < 0) return false
      const style = getComputedStyle(node)
      return style.display !== "none" && style.visibility !== "hidden"
    })
    return visible[0]?.textContent?.trim() ?? ""
  })
  expect(first).toBe("Skip to content")
  const skip = page.getByRole("link", { name: "Skip to content" })
  await skip.focus()
  await expect(skip).toBeFocused()
})

test("pages have no serious axe violations and do not overflow", async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow, route).toBeLessThanOrEqual(1)
    const results = await new AxeBuilder({ page }).analyze()
    const serious = results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical")
    expect(serious, `${route}\n${JSON.stringify(serious, null, 2)}`).toEqual([])
  }
})
