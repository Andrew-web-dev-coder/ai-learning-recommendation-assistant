export function Loading({ message = 'Loading…' }: { message?: string }) {
  return <p role="status" className="hint">{message}</p>
}

export function ErrorMessage({ message }: { message: string }) {
  return <p role="alert">{message}</p>
}
