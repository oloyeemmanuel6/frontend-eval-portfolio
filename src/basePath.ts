/**
 * GitHub Pages base path.
 * Project sites are served from /<repository-name>/.
 * A user site named <owner>.github.io is served from /.
 */
export function resolveBase(env: {
  VITE_BASE?: string
  GITHUB_REPOSITORY?: string
  GITHUB_REPOSITORY_OWNER?: string
}): string {
  const fromEnv = env.VITE_BASE?.trim()
  if (fromEnv) {
    if (fromEnv === "/") return "/"
    let base = fromEnv.startsWith("/") ? fromEnv : `/${fromEnv}`
    if (!base.endsWith("/")) base = `${base}/`
    return base
  }
  const repo = env.GITHUB_REPOSITORY
  const owner = env.GITHUB_REPOSITORY_OWNER
  if (repo && owner && repo.includes("/")) {
    const name = repo.slice(repo.indexOf("/") + 1)
    if (name && name.toLowerCase() !== `${owner.toLowerCase()}.github.io`) {
      return `/${name}/`
    }
  }
  return "/"
}
