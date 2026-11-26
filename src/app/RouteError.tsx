import { Link } from 'react-router'
import { ErrorMessage } from '../shared/Status'

export function RouteError() {
  return (
    <div className="app">
      <main>
        <h1>Page unavailable</h1>
        <ErrorMessage message="This page could not be displayed." />
        <Link className="back-link" to="/courses">
          Back to courses
        </Link>
      </main>
    </div>
  )
}
