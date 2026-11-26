import { Link, Outlet, useParams } from 'react-router'
import { isPathId } from '../../shared/ids'

export default function DiagnosticSession() {
  const { courseId, exerciseId } = useParams()
  if (!isPathId(courseId) || !isPathId(exerciseId)) {
    return (
      <section className="panel">
        <h2>Invalid course or exercise address</h2>
        <Link to="/courses">Back to courses</Link>
      </section>
    )
  }

  return <Outlet key={`${courseId}/${exerciseId}`} context={{ courseId, exerciseId }} />
}
