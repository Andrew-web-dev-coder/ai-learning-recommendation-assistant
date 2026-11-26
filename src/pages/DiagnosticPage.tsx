import { useCallback } from 'react'
import { Link } from 'react-router'
import { AnswerForm } from '../features/learning/AnswerForm'
import { getExercises } from '../features/learning/api'
import { useDiagnosticSession } from '../features/learning/session'
import { useRead } from '../features/learning/useRead'
import { ErrorMessage, Loading } from '../shared/Status'

export function Component() {
  const { courseId, exerciseId } = useDiagnosticSession()
  const load = useCallback((signal: AbortSignal) => getExercises(courseId, signal), [courseId])
  const state = useRead(load)
  const exercise = state.status === 'success'
    ? state.data.find((item) => item.exercise_id === exerciseId)
    : undefined

  return (
    <>
      <p><Link to={`/courses/${courseId}`}>Back to course</Link></p>
      {state.status === 'loading' && <Loading message="Loading exercise…" />}
      {state.status === 'error' && <ErrorMessage message={state.message} />}
      {state.status === 'success' && (exercise
        ? <AnswerForm exercise={exercise} />
        : <ErrorMessage message="This exercise is unavailable for this course." />)}
    </>
  )
}
