import { Link } from 'react-router'

export function Component() {
  return (
    <section className="panel">
      <h2>Page not found</h2>
      <Link to="/courses">Back to courses</Link>
    </section>
  )
}
