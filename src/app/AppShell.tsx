import { Link, Outlet, useNavigation } from 'react-router'
import { Loading } from '../shared/Status'
import './shell.css'

export function AppShell() {
  const navigation = useNavigation()

  return (
    <div className="app">
      <header className="header">
        <span className="eyebrow">EHU AI-NATIVE PRACTICE</span>
        <h1>AI Learning Recommendation Assistant</h1>
        <nav aria-label="Main navigation">
          <Link to="/courses">Courses</Link>
        </nav>
      </header>
      <main>
        {navigation.state !== 'idle' && <Loading message="Loading page…" />}
        <Outlet />
      </main>
      <footer>Prototype · Deterministic learning recommendations · 2026</footer>
    </div>
  )
}

export function InitialLoading() {
  return <main className="app"><Loading message="Loading page…" /></main>
}
