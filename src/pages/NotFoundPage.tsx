import { Link } from 'react-router'

export function Component() {
  return (
    <section className="panel">
      <h1>Page not found</h1>
      <Link className="back-link" to="/courses">
        Back to courses
      </Link>
    </section>
  )
}
