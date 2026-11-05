import { copyFileSync } from "node:fs"
import { resolve } from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"
import { resolveBase } from "./src/basePath.ts"

export default defineConfig({
  base: resolveBase(process.env),
  plugins: [
    react(),
    {
      name: "github-pages-spa-fallback",
      apply: "build",
      closeBundle() {
        const dist = resolve("dist")
        copyFileSync(resolve(dist, "index.html"), resolve(dist, "404.html"))
      },
    },
  ],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
})
