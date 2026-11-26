import { useId, useRef } from 'react'
import { Button } from './Button'

interface SearchInputProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function SearchInput({ label, value, onChange }: SearchInputProps) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)

  return (
    <div role="search" aria-label={label}>
      <label htmlFor={id}>{label}</label>
      <div className="search-controls">
        <input
          ref={input}
          id={id}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <Button
          disabled={!value}
          onClick={() => {
            onChange('')
            input.current?.focus()
          }}
        >
          Clear search
        </Button>
      </div>
    </div>
  )
}
