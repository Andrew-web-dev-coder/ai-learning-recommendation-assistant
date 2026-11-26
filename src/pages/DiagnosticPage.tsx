import { Link } from 'react-router'
import { AnswerForm } from '../features/learning/AnswerForm'
import { useGetCourseExercisesQuery } from '../features/learning/api'
import { QueryFeedback } from '../features/learning/QueryFeedback'
import { useExerciseScope } from '../features/learning/session'
import { ErrorMessage, Loading } from '../shared/Status'

export function Component() {
  const { courseId, exerciseId } = useExerciseScope()
  const { currentData, isFetching, error, refetch } = useGetCourseExercisesQuery(courseId)
  const exercise = currentData?.exercises.find((item) => item.exercise_id === exerciseId)

  return (
    <>
      <p>
        <Link className="back-link" to={`/courses/${courseId}`}>
          Back to course
        </Link>
      </p>
      {!currentData && isFetching ? (
        <section className="panel">
          <h1>Diagnostic exercise</h1>
          <Loading message="Loading exercise…" />
        </section>
      ) : (
        <>
          {exercise ? <AnswerForm exercise={exercise} /> : <h1>Diagnostic exercise</h1>}
          {currentData && !exercise && (
            <ErrorMessage message="This exercise is unavailable for this course." />
          )}
          <QueryFeedback isFetching={isFetching} error={error} onRefresh={() => void refetch()} />
        </>
      )}
    </>
  )
}
