/** Prefix a public/ file so it works at the GitHub Pages base path. */
export function publicUrl(path: string): string {
  const base = import.meta.env.BASE_URL
  return base + path.replace(/^\//, "")
}

/** React Router wants a basename with no trailing slash, except for "/". */
export function routerBasename(): string {
  const base = import.meta.env.BASE_URL
  if (base === "/") return "/"
  return base.replace(/\/$/, "")
}
