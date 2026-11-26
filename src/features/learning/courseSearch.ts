import type { Course } from './api'

export function searchCourses(courses: readonly Course[], search: string) {
  const term = search.trim().toLowerCase()
  if (!term) return courses

  return courses.filter(({ title, course_code }) =>
    title.toLowerCase().includes(term) || course_code.toLowerCase().includes(term))
}
