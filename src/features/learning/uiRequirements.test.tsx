import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { Component as CoursesPage } from '../../pages/CoursesPage'
import { answerValidationMessage, maxAnswerLength } from './answerValidation'
import type { Assessment } from './api'
import { AssessmentResult } from './AssessmentResult'
import { searchCourses } from './courseSearch'
import { RecommendationCard } from './RecommendationCard'
import type { DecisionState } from './workflowSlice'

const { useGetCoursesQuery, useDiagnosticSession } = vi.hoisted(() => ({
  useGetCoursesQuery: vi.fn(),
  useDiagnosticSession: vi.fn(),
}))
vi.mock('./api', () => ({ useGetCoursesQuery }))
vi.mock('./session', () => ({ useDiagnosticSession }))
vi.mock('../../shared/storeHooks', () => ({ useAppDispatch: () => vi.fn() }))

const courses = [
  { course_id: '1', course_code: 'PY_INTRO', title: 'Introductory Python' },
  { course_id: '2', course_code: 'LT_GRAMMAR', title: 'Lithuanian Grammar' },
]

function renderCatalog(query: { currentData?: { courses: typeof courses }; isFetching?: boolean; error?: unknown }) {
  useGetCoursesQuery.mockReturnValue({ isFetching: false, refetch: vi.fn(), ...query })
  return renderToStaticMarkup(<MemoryRouter><CoursesPage /></MemoryRouter>)
}

describe('catalog search and feedback', () => {
  it('matches a title substring case-insensitively', () => {
    expect(searchCourses(courses, '  pYtHoN  ')).toEqual([courses[0]])
  })

  it('matches a course code case-insensitively', () => {
    expect(searchCourses(courses, 'lt_grammar')).toEqual([courses[1]])
  })

  it('returns no matches and restores the collection when the query is cleared', () => {
    expect(searchCourses(courses, 'unavailable')).toEqual([])
    expect(searchCourses(courses, '')).toBe(courses)
    expect(searchCourses(courses, '  ')).toBe(courses)
  })

  it('renders initial loading without an empty message or a search field', () => {
    const markup = renderCatalog({ isFetching: true })
    expect(markup).toContain('Loading courses…')
    expect(markup).not.toMatch(/No courses|type="search"/)
  })

  it('renders a read failure and retry without an empty success message', () => {
    const markup = renderCatalog({ error: { kind: 'server', message: 'The service encountered an error.' } })
    expect(markup).toContain('role="alert"')
    expect(markup).toContain('Retry loading')
    expect(markup).not.toContain('No courses are available')
  })

  it('identifies a successful empty catalog', () => {
    expect(renderCatalog({ currentData: { courses: [] } })).toContain('No courses are available.')
  })

  it('keeps cached course links and search visible when refresh fails', () => {
    const markup = renderCatalog({ currentData: { courses }, error: { kind: 'server', message: 'Refresh failed' } })
    expect(markup).toContain('Introductory Python')
    expect(markup).toContain('type="search"')
    expect(markup).toContain('Refresh failed')
  })
})

describe('answer validation', () => {
  it.each(['', ' \n\t '])('requires a nonblank answer (%j)', (answer) => {
    expect(answerValidationMessage(answer)).toBe('Enter an answer before submitting.')
  })

  it('uses the contract length boundary in UTF-16 code units', () => {
    const answer = '🎓'.repeat(maxAnswerLength / 2)
    expect(answerValidationMessage(answer)).toBeUndefined()
    expect(answerValidationMessage(answer + 'a')).toContain('5,000')
  })

  it.each(['aš einu į mokyklą', 'int(x)', '1'])('supports free-form exercise answers (%s)', (answer) => {
    expect(answerValidationMessage(answer)).toBeUndefined()
  })
})

const recommendation: NonNullable<Assessment['recommendation']> = {
  recommendation_id: '10',
  recommendation_rule_id: '1',
  topic_id: '2',
  topic_title: 'Type Conversion',
  explanation: 'Convert the string before comparing.',
  learner_decision: 'pending',
}

function renderAssessment(assessment: Assessment) {
  useDiagnosticSession.mockReturnValue({
    scope: { courseId: '1', exerciseId: '1' },
    workflow: { status: 'confirmed', assessment, decision: { status: 'idle' } },
    canDecide: Boolean(assessment.recommendation),
  })
  return renderToStaticMarkup(<AssessmentResult />)
}

describe('assessment result', () => {
  it('displays a correct result with the service message', () => {
    const markup = renderAssessment({
      status: 'ok', assessment_status: 'correct', attempt_id: '1', is_correct: true,
      error_category_id: null, recommendation: null, message: 'Answer classified as correct.',
    })
    expect(markup).toContain('Correct answer')
    expect(markup).toContain('Answer classified as correct.')
    expect(markup).not.toContain('Recommended next topic')
  })

  it('displays an incorrect result with the category ID and recommended topic', () => {
    const markup = renderAssessment({
      status: 'ok', assessment_status: 'incorrect', attempt_id: '2', is_correct: false,
      error_category_id: '17', recommendation,
    })
    expect(markup).toContain('Incorrect answer')
    expect(markup).toContain('<dt>Error category ID</dt><dd>17</dd>')
    expect(markup).toContain(recommendation.topic_title)
  })
})

function renderRecommendation(decision: DecisionState, canDecide = false) {
  return renderToStaticMarkup(<RecommendationCard recommendation={recommendation}
    decision={decision} canDecide={canDecide} onDecide={vi.fn()} />)
}

describe('recommendation feedback', () => {
  it('renders the supplied topic and explanation and disables both actions during a write', () => {
    const markup = renderRecommendation({ status: 'pending' })
    expect(markup).toContain(recommendation.topic_title)
    expect(markup).toContain(recommendation.explanation)
    expect(markup).toContain('Saving your recommendation decision')
    expect(markup.match(/disabled=""/g)).toHaveLength(2)
  })

  it.each(['accepted', 'rejected'] as const)('displays the confirmed %s decision and closes controls', (value) => {
    const markup = renderRecommendation({ status: 'saved', value })
    expect(markup.toLowerCase()).toContain(`<strong>${value}</strong>`)
    expect(markup).not.toContain('<button')
  })

  it('labels determinate failures and keeps permitted actions available', () => {
    const markup = renderRecommendation({ status: 'failed', error: { kind: 'invalid', message: 'Invalid request.' } }, true)
    expect(markup).toContain('Could not save your decision. Invalid request.')
    expect(markup).toContain('Accept recommendation')
    expect(markup).not.toContain('disabled=""')
  })

  it('displays conflict without inferring a decision or keeping actions available', () => {
    const markup = renderRecommendation({ status: 'conflict', error: { kind: 'conflict', message: 'A decision was already recorded.' } })
    expect(markup).toContain('A decision was already recorded.')
    expect(markup).not.toMatch(/<button|Saved decision/)
  })

  it('displays ambiguous outcomes and closes controls', () => {
    const markup = renderRecommendation({ status: 'ambiguous', error: { kind: 'network', message: 'Connection lost.' } })
    expect(markup).toContain('We could not confirm whether the decision was saved.')
    expect(markup).not.toContain('<button')
  })
})
