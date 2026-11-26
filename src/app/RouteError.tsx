import { Link } from 'react-router'
import { ErrorMessage } from '../shared/Status'

export function RouteError() {
  return (
    <main className="app">
      <h1>Page unavailable</h1>
      <ErrorMessage message="This page could not be displayed." />
      <Link to="/courses">Back to courses</Link>
    </main>
  )
}
