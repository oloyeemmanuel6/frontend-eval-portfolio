import { expect, test } from "@playwright/test"

const ROUTES = ["/", "/results", "/eval", "/samples", "/samples/cefr-gauge", "/samples/flashcards", "/samples/error-highlighter", "/samples/review", "/about"]

test("internal downloads return real files and external links stay limited", async ({ page, request }) => {
  const hrefs = new Set<string>()
  for (const route of ROUTES) {
    await page.goto(route)
    const found = await page.locator("a[href]").evaluateAll((anchors) => anchors.map((anchor) => (anchor as HTMLAnchorElement).href))
    for (const href of found) hrefs.add(href)
    const text = await page.locator("body").innerText()
    expect(text, route).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
    expect(text, route).not.toMatch(/Emmanuel/)
    expect(text, route).not.toMatch(/lorem ipsum/i)
  }

  const youtube = [...hrefs].filter((href) => href.startsWith("https://youtu.be/RIdedj__RlQ"))
  expect(youtube.length).toBeGreaterThan(0)
  const blocked = [...hrefs].filter((href) => /mailto:|tel:|github\.com/i.test(href))
  expect(blocked).toEqual([])

  const local = [...hrefs].filter((href) => href.startsWith("http://127.0.0.1:4173/"))
  expect(local.length).toBeGreaterThan(5)
  for (const href of local) {
    const response = await request.get(href)
    expect(response.status(), href).toBeLessThan(400)
    const body = await response.body()
    expect(body.byteLength, href).toBeGreaterThan(80)
    if (href.endsWith(".zip")) {
      expect(body.subarray(0, 2).toString("utf8"), href).toBe("PK")
    }
  }
})

test("unknown routes explain themselves", async ({ page }) => {
  await page.goto("/not-a-page")
  await expect(page.getByRole("heading", { name: "That address is not on this site." })).toBeVisible()
})
