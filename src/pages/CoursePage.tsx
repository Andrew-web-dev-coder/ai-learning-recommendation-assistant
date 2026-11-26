import { useCallback } from 'react'
import { Link, useParams } from 'react-router'
import { getCourse } from '../features/learning/api'
import { useRead } from '../features/learning/useRead'
import { isPathId } from '../shared/ids'
import { ErrorMessage, Loading } from '../shared/Status'

function Course({ courseId }: { courseId: string }) {
  const load = useCallback((signal: AbortSignal) => getCourse(courseId, signal), [courseId])
  const state = useRead(load)

  if (state.status === 'loading') return <Loading message="Loading course…" />
  if (state.status === 'error') return <ErrorMessage message={state.message} />
  const { course, topics, exercises } = state.data
  if (!course) return <ErrorMessage message="Course not found." />

  return (
    <section className="panel">
      <h2>{course.title}</h2>
      <h3>Topics</h3>
      {topics.length ? (
        <ol>{topics.map((topic) => <li key={topic.topic_id}>{topic.title}</li>)}</ol>
      ) : <p>No topics are available.</p>}
      <h3>Diagnostic exercises</h3>
      {exercises.length ? (
        <ul>
          {exercises.map((exercise) => (
            <li key={exercise.exercise_id}>
              <Link to={`exercises/${exercise.exercise_id}`}>
                Exercise {exercise.exercise_id}
              </Link>
              <p className="prompt">{exercise.prompt}</p>
            </li>
          ))}
        </ul>
      ) : <p>No active exercises are available for this course.</p>}
    </section>
  )
}

export function Component() {
  const { courseId } = useParams()
  return (
    <>
      <p><Link to="/courses">Back to courses</Link></p>
      {isPathId(courseId) ? <Course key={courseId} courseId={courseId} />
        : <ErrorMessage message="Invalid course address." />}
    </>
  )
}
