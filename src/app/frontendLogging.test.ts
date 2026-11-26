import { configureStore } from '@reduxjs/toolkit'
import { afterEach, expect, it, vi } from 'vitest'
import { learningApi } from '../features/learning/api'
import { frontendLogging } from './frontendLogging'

afterEach(() => vi.restoreAllMocks())

it('logs one sanitized rejection and skips aborted and deduplicated operations', () => {
  const log = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const store = configureStore({
    reducer: (state = {}) => state,
    middleware: (get) => get().concat(frontendLogging),
  })
  const reject = {
    type: `${learningApi.reducerPath}/executeMutation/rejected`,
    payload: { status: 500, message: 'sensitive response', body: 'secret token' },
    meta: {
      requestStatus: 'rejected',
      arg: { endpointName: 'submitAttempt', originalArgs: { answer: 'private learner answer' } },
      aborted: false,
      condition: false,
    },
  }
  store.dispatch(reject)
  store.dispatch({ ...reject, meta: { ...reject.meta, aborted: true } })
  store.dispatch({ ...reject, meta: { ...reject.meta, condition: true } })
  expect(log.mock.calls).toEqual([
    ['[learning-assistant]', { event: 'request_failed', operation: 'submitAttempt', status: 500 }],
  ])
})
