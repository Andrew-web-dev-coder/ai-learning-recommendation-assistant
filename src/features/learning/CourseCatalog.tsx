import { useState } from 'react'
import { Link } from 'react-router'
import { SearchInput } from '../../shared/SearchInput'
import { StatusMessage } from '../../shared/Status'
import type { Course } from './api'
import { searchCourses } from './courseSearch'

export function CourseCatalog({ courses }: { courses: readonly Course[] }) {
  const [search, setSearch] = useState('')
  const matches = searchCourses(courses, search)
  const count = matches.length

  if (!courses.length) return <StatusMessage>No courses are available.</StatusMessage>

  return (
    <>
      <SearchInput label="Search by course title or code" value={search} onChange={setSearch} />
      <StatusMessage>
        {count === 0
          ? 'No courses match your search. Try another title or code, or clear the search.'
          : `${count} ${count === 1 ? 'course' : 'courses'} shown.`}
      </StatusMessage>
      {count > 0 && (
        <ul className="catalog-list" role="list">
          {matches.map((course) => (
            <li key={course.course_id}>
              <Link className="course-card" to={course.course_id} aria-label={course.title}>
                <span>{course.title}</span>
                <span className="hint">{course.course_code}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
