import type { ReactNode } from 'react'

export function StatusMessage({ children }: { children: ReactNode }) {
  return <p role="status" className="hint">{children}</p>
}

export function Loading({ message = 'Loading…' }: { message?: string }) {
  return <StatusMessage>{message}</StatusMessage>
}

export function ErrorMessage({ message, id }: { message: string; id?: string }) {
  return <p id={id} role="alert" className="error-message">{message}</p>
}
