export function isPathId(value: string | undefined): value is string {
  return (
    value !== undefined &&
    value === value.trim() &&
    /^[1-9][0-9]{0,18}$/.test(value) &&
    BigInt(value) <= 9223372036854775807n
  )
}

export function isAttemptExerciseId(value: string): boolean {
  return isPathId(value) && Number.isSafeInteger(Number(value))
}
