import { Link } from 'react-router'
import { useGetCoursesQuery } from '../features/learning/api'
import { QueryFeedback } from '../features/learning/QueryFeedback'
import { Loading } from '../shared/Status'

export function Component() {
  const { currentData, isFetching, error, refetch } = useGetCoursesQuery()

  return (
    <section className="panel">
      <h2>Choose a course</h2>
      {!currentData && isFetching ? <Loading message="Loading courses…" /> : (
        <>
          {currentData && (currentData.courses.length ? (
            <ul>
              {currentData.courses.map((course) => (
                <li key={course.course_id}><Link to={course.course_id}>{course.title}</Link></li>
              ))}
            </ul>
          ) : <p>No courses are available.</p>)}
          <QueryFeedback isFetching={isFetching} error={error} onRefresh={() => void refetch()} />
        </>
      )}
    </section>
  )
}
