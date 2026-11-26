import { useGetCoursesQuery } from '../features/learning/api'
import { CourseCatalog } from '../features/learning/CourseCatalog'
import { QueryFeedback } from '../features/learning/QueryFeedback'
import { Loading } from '../shared/Status'

export function Component() {
  const { currentData, isFetching, error, refetch } = useGetCoursesQuery()

  return (
    <section className="panel">
      <h2>Choose a course</h2>
      {!currentData && !error && isFetching ? <Loading message="Loading courses…" /> : (
        <>
          {currentData && <CourseCatalog courses={currentData.courses} />}
          <QueryFeedback isFetching={isFetching} error={error} onRefresh={() => void refetch()} />
        </>
      )}
    </section>
  )
}
