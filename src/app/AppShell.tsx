import { useLayoutEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation, useNavigation } from 'react-router'
import { Loading } from '../shared/Status'
import { ThemeToggle } from './ThemeToggle'
import './shell.css'

export function AppShell() {
  const navigation = useNavigation()
  const { pathname } = useLocation()
  const previousPath = useRef(pathname)
  const main = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (previousPath.current === pathname) return
    previousPath.current = pathname
    main.current?.focus()
  }, [pathname])

  return (
    <div className="app">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          main.current?.focus()
        }}
      >
        Skip to content
      </a>
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              LP
            </span>
            <span>Learning Path Assistant</span>
          </div>
          <div className="header-tools">
            <nav aria-label="Main navigation">
              <NavLink to="/courses" end>
                Courses
              </NavLink>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main id="main-content" ref={main} tabIndex={-1}>
        {navigation.state !== 'idle' && <Loading message="Loading page…" />}
        <Outlet />
      </main>
      <footer>EHU AI-Native Practice · 2026</footer>
    </div>
  )
}

export function InitialLoading() {
  return (
    <div className="app">
      <main>
        <Loading message="Loading page…" />
      </main>
    </div>
  )
}
