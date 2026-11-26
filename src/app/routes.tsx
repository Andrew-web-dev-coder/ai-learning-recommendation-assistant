import { Navigate, type RouteObject } from 'react-router'
import DiagnosticSession from '../features/learning/DiagnosticSession'
import { AppShell, InitialLoading } from './AppShell'
import { RouteError } from './RouteError'

export const routes: RouteObject[] = [
  {
    Component: AppShell,
    HydrateFallback: InitialLoading,
    ErrorBoundary: RouteError,
    children: [
      { index: true, element: <Navigate to="/courses" replace /> },
      { path: 'courses', lazy: () => import('../pages/CoursesPage') },
      { path: 'courses/:courseId', lazy: () => import('../pages/CoursePage') },
      {
        path: 'courses/:courseId/exercises/:exerciseId',
        Component: DiagnosticSession,
        children: [
          { index: true, lazy: () => import('../pages/DiagnosticPage') },
          { path: 'result', lazy: () => import('../pages/ResultPage') },
        ],
      },
      { path: '*', lazy: () => import('../pages/NotFoundPage') },
    ],
  },
]
