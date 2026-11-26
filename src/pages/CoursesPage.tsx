import { Link } from 'react-router'
import { getCourses } from '../features/learning/api'
import { useRead } from '../features/learning/useRead'
import { ErrorMessage, Loading } from '../shared/Status'

export function Component() {
  const courses = useRead(getCourses)
  return (
    <section className="panel">
      <h2>Choose a course</h2>
      {courses.status === 'loading' && <Loading message="Loading courses…" />}
      {courses.status === 'error' && <ErrorMessage message={courses.message} />}
      {courses.status === 'success' && (
        courses.data.length ? (
          <ul>
            {courses.data.map((course) => (
              <li key={course.course_id}><Link to={course.course_id}>{course.title}</Link></li>
            ))}
          </ul>
        ) : <p>No courses are available.</p>
      )}
    </section>
  )
}
