import { isAnyOf, type Middleware } from '@reduxjs/toolkit'
import { learningApi } from '../features/learning/api'

const { getHealth, getCourses, getCourseTopics, getCourseExercises, submitAttempt, saveDecision } =
  learningApi.endpoints

const requestRejected = isAnyOf(
  getHealth.matchRejected,
  getCourses.matchRejected,
  getCourseTopics.matchRejected,
  getCourseExercises.matchRejected,
  submitAttempt.matchRejected,
  saveDecision.matchRejected,
)

export const frontendLogging: Middleware = () => (next) => (action) => {
  const result = next(action)
  if (requestRejected(action) && !action.meta.aborted && !action.meta.condition) {
    const status = action.payload?.status
    console.warn('[learning-assistant]', {
      event: 'request_failed',
      operation: action.meta.arg.endpointName,
      status: typeof status === 'number' ? status : undefined,
    })
  }
  return result
}
