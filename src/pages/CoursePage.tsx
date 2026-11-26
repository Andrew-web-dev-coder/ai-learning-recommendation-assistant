import { Link, useParams } from 'react-router'
import { useGetCoursesQuery, useGetCourseTopicsQuery, useGetCourseExercisesQuery } from '../features/learning/api'
import { QueryFeedback } from '../features/learning/QueryFeedback'
import { isPathId } from '../shared/ids'
import { ErrorMessage, Loading } from '../shared/Status'

function Course({ courseId }: { courseId: string }) {
  const catalog = useGetCoursesQuery()
  const topics = useGetCourseTopicsQuery(courseId)
  const exercises = useGetCourseExercisesQuery(courseId)
  const queries = [catalog, topics, exercises]
  const fetching = queries.some((query) => query.isFetching)
  const error = topics.error ?? exercises.error ?? catalog.error

  if (!error && queries.some((query) => query.isFetching && !query.currentData)) {
    return <Loading message="Loading course…" />
  }

  function refresh() {
    const failed = queries.filter((query) => query.isError)
    for (const query of failed.length ? failed : queries) void query.refetch()
  }

  const course = catalog.currentData?.courses.find((item) => item.course_id === courseId)
  return (
    <section className="panel">
      <h2>{course?.title ?? 'Course'}</h2>
      {!course && catalog.currentData && !error && <ErrorMessage message="Course not found." />}
      {topics.currentData && (
        <>
          <h3>Topics</h3>
          {topics.currentData.topics.length ? (
            <ol>{topics.currentData.topics.map((topic) => <li key={topic.topic_id}>{topic.title}</li>)}</ol>
          ) : <p>No topics are available.</p>}
        </>
      )}
      {exercises.currentData && (
        <>
          <h3>Diagnostic exercises</h3>
          {exercises.currentData.exercises.length ? (
            <ul>
              {exercises.currentData.exercises.map((exercise) => (
                <li key={exercise.exercise_id}>
                  <Link to={`exercises/${exercise.exercise_id}`}>Exercise {exercise.exercise_id}</Link>
                  <p className="prompt">{exercise.prompt}</p>
                </li>
              ))}
            </ul>
          ) : <p>No active exercises are available for this course.</p>}
        </>
      )}
      <QueryFeedback isFetching={fetching} error={error} onRefresh={refresh} />
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
