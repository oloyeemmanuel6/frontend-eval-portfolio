import { Link } from "react-router"
import { useTitle } from "../useTitle.ts"

export function NotFoundPage() {
  useTitle("Page not found")
  return (
    <article className="page">
      <p className="eyebrow">Missing page</p>
      <h1>That address is not on this site.</h1>
      <p className="lede">The portfolio has a home page, the graded results, the eval, and the task samples.</p>
      <p>
        <Link className="btn btn-primary" to="/">
          Back to the start
        </Link>
      </p>
    </article>
  )
}
