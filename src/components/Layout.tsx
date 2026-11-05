import { NavLink, Outlet } from "react-router"
import { publicUrl } from "../publicUrl.ts"

const LINKS = [
  { to: "/results", label: "Results" },
  { to: "/eval", label: "Eval" },
  { to: "/samples", label: "Task samples" },
  { to: "/about", label: "About" },
]

export function Layout() {
  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <header className="site-header">
        <NavLink to="/" className="wordmark" end>
          <span className="wordmark-name">Dami</span>
          <span className="wordmark-role">English teaching</span>
        </NavLink>
        <nav className="site-nav" aria-label="Primary">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main id="content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-grid">
          <p>
            <strong>Dami</strong>
            <span>English At Your Service</span>
          </p>
          <p>Self-initiated demonstration. Not an official micro1 site.</p>
          <p>
            <a href="https://youtu.be/RIdedj__RlQ">Eval walkthrough on YouTube</a>
          </p>
          <p>A GitHub profile link is omitted until a repository name is set.</p>
        </div>
        <p className="footer-mark">
          <img src={publicUrl("favicon.svg")} alt="" width="20" height="20" />
          <span>Portfolio build for local preview and GitHub Pages.</span>
        </p>
      </footer>
    </>
  )
}
