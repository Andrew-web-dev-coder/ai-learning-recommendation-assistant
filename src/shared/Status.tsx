import type { ReactNode } from 'react'

export function StatusMessage({ children, tone }: { children: ReactNode; tone?: 'success' }) {
  return (
    <p role="status" className={tone ? `status-message status-message--${tone}` : 'status-message hint'}>
      {children}
    </p>
  )
}

export function Loading({ message = 'Loading…' }: { message?: string }) {
  return <StatusMessage>{message}</StatusMessage>
}

export function ErrorMessage({ message, id }: { message: string; id?: string }) {
  return (
    <p id={id} role="alert" className="error-message">
      {message}
    </p>
  )
}
