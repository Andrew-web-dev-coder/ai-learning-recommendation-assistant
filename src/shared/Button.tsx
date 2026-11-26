import type { ComponentPropsWithoutRef } from 'react'

type ButtonProps = Omit<ComponentPropsWithoutRef<'button'>, 'className'> & {
  variant?: 'primary' | 'secondary'
}

export function Button({ variant = 'secondary', type = 'button', ...props }: ButtonProps) {
  return <button {...props} type={type} className={`${variant}-button`} />
}
