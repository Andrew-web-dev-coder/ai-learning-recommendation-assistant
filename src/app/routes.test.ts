import { describe, expect, it } from 'vitest'
import { matchRoutes } from 'react-router'
import { isAttemptExerciseId, isPathId } from '../shared/ids'
import { routes } from './routes'

describe('learning routes', () => {
  it.each([
    ['/courses', 'courses'],
    ['/courses/1', 'courses/:courseId'],
    ['/courses/1/exercises/2/result', 'result'],
    ['/unrecognized', '*'],
  ])('matches %s to its lazy page', (url, path) => {
    const match = matchRoutes(routes, url)?.at(-1)
    expect(match?.route.path).toBe(path)
    expect(match?.route.lazy).toBeTypeOf('function')
  })

  it('shares the diagnostic session route across the form and result', () => {
    const form = matchRoutes(routes, '/courses/1/exercises/2')
    const result = matchRoutes(routes, '/courses/1/exercises/2/result')
    expect(form?.at(-1)?.route.index).toBe(true)
    expect(form?.at(-1)?.route.lazy).toBeTypeOf('function')
    expect(form?.at(-2)?.route).toBe(result?.at(-2)?.route)
    expect(result?.at(-1)?.params).toEqual({ courseId: '1', exerciseId: '2' })
  })
})

describe('route and submission identifiers', () => {
  it.each([undefined, '0', '01', '-1', '1\n', '1/2', '9223372036854775808'])(
    'rejects invalid route ID %s', (value) => expect(isPathId(value)).toBe(false),
  )

  it('preserves BIGINT route IDs and enforces the narrower POST boundary', () => {
    expect(isPathId('9223372036854775807')).toBe(true)
    expect(isAttemptExerciseId('9007199254740991')).toBe(true)
    expect(isAttemptExerciseId('9007199254740992')).toBe(false)
  })
})
