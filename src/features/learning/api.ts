import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react'
import { isAttemptExerciseId, isPathId } from '../../shared/ids'
import { isRecord, normalizeApiError, unexpectedResponse, type ApiError } from './apiErrors'

interface Health {
  status: 'ok'
  database: string
  message: string
}

export interface Course {
  course_id: string
  course_code: string
  title: string
}

interface Topic {
  topic_id: string
  title: string
  position: number
}

export interface Exercise {
  exercise_id: string
  topic_id: string
  prompt: string
  exercise_type: 'code' | 'text' | 'multiple_choice'
  is_active: true
}

export type Decision = 'accepted' | 'rejected'

interface Recommendation {
  recommendation_id: string
  recommendation_rule_id: string
  topic_id: string
  topic_title: string
  explanation: string
  learner_decision: 'pending'
}

export type Assessment =
  | { status: 'ok'; assessment_status: 'correct'; attempt_id: string; is_correct: true;
      error_category_id: null; recommendation: null; message: string }
  | { status: 'ok'; assessment_status: 'incorrect'; attempt_id: string; is_correct: false;
      error_category_id: string; recommendation: Recommendation }

interface DecisionResponse {
  status: 'ok'
  message: string
  recommendation: { recommendation_id: string; attempt_id: string; learner_decision: Decision }
}

interface SubmitAttempt {
  courseId: string
  exerciseId: string
  answer: string
}

interface SaveDecision {
  recommendationId: string
  attemptId: string
  decision: Decision
}

type CourseCollection<T extends string, Item> = { status: 'ok'; course_id: string } & Record<T, Item[]>

const demoLearnerId = 1
const fetchApi = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  responseHandler: 'content-type',
  timeout: 12_000,
})

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, ApiError, object, FetchBaseQueryMeta> =
  async (args, api, options) => {
    const result = await fetchApi(args, api, options)
    if (result.error) return { error: normalizeApiError(result.error), meta: result.meta }
    if (!isRecord(result.data) || result.data.status !== 'ok') {
      return { error: unexpectedResponse(result.meta?.response?.status), meta: result.meta }
    }
    return { data: result.data, meta: result.meta }
  }

function isId(value: unknown): value is string {
  return typeof value === 'string' && isPathId(value)
}

function isAssessment(data: unknown): data is Assessment {
  if (!isRecord(data) || !isId(data.attempt_id)) return false
  if (data.assessment_status === 'correct') {
    return data.is_correct === true && data.error_category_id === null &&
      data.recommendation === null && typeof data.message === 'string'
  }
  const recommendation = data.recommendation
  return data.assessment_status === 'incorrect' && data.is_correct === false &&
    isId(data.error_category_id) && isRecord(recommendation) &&
    isId(recommendation.recommendation_id) && isId(recommendation.recommendation_rule_id) &&
    isId(recommendation.topic_id) && typeof recommendation.topic_title === 'string' &&
    typeof recommendation.explanation === 'string' && recommendation.learner_decision === 'pending'
}

function isDecisionResponse(data: unknown, request: SaveDecision): data is DecisionResponse {
  if (!isRecord(data) || typeof data.message !== 'string') return false
  const saved = data.recommendation
  return isRecord(saved) && saved.recommendation_id === request.recommendationId &&
    saved.attempt_id === request.attemptId && saved.learner_decision === request.decision
}

export const learningApi = createApi({
  reducerPath: 'learningApi',
  baseQuery,
  keepUnusedDataFor: 120,
  refetchOnMountOrArgChange: 60,
  refetchOnReconnect: true,
  tagTypes: ['Exercises'],
  endpoints: (build) => ({
    getHealth: build.query<Health, void>({
      query: () => '/api/health',
      keepUnusedDataFor: 15,
    }),
    getCourses: build.query<{ status: 'ok'; courses: Course[] }, void>({
      query: () => '/api/courses',
    }),
    getCourseTopics: build.query<CourseCollection<'topics', Topic>, string>({
      query: (courseId) => `/api/courses/${encodeURIComponent(courseId)}/topics`,
    }),
    getCourseExercises: build.query<CourseCollection<'exercises', Exercise>, string>({
      query: (courseId) => `/api/courses/${encodeURIComponent(courseId)}/exercises`,
      providesTags: (result, _error, courseId) => result ? [{ type: 'Exercises', id: courseId }] : [],
    }),
    submitAttempt: build.mutation<Assessment, SubmitAttempt>({
      async queryFn({ exerciseId, answer }, _api, _options, query) {
        if (!isAttemptExerciseId(exerciseId) || !answer.trim() || answer.length > 5000) {
          return { error: { kind: 'invalid', message: 'Choose a valid exercise and enter an answer.' } }
        }
        const result = await query({
          url: '/api/attempts',
          method: 'POST',
          redirect: 'error',
          body: { learner_id: demoLearnerId, exercise_id: Number(exerciseId), submitted_answer: answer },
        })
        if (result.error) return { error: result.error }
        const status = result.meta?.response?.status
        return status === 201 && isAssessment(result.data)
          ? { data: result.data }
          : { error: unexpectedResponse(status) }
      },
      invalidatesTags: (_result, error, { courseId }) => error?.staleExercise
        ? [{ type: 'Exercises', id: courseId }]
        : [],
    }),
    saveDecision: build.mutation<DecisionResponse, SaveDecision>({
      async queryFn(request, _api, _options, query) {
        const result = await query({
          url: `/api/recommendations/${encodeURIComponent(request.recommendationId)}/decision`,
          method: 'PATCH',
          redirect: 'error',
          body: { decision: request.decision },
        })
        if (result.error) return { error: result.error }
        const status = result.meta?.response?.status
        return status === 200 && isDecisionResponse(result.data, request)
          ? { data: result.data }
          : { error: unexpectedResponse(status) }
      },
    }),
  }),
})

export const { useGetCoursesQuery, useGetCourseTopicsQuery, useGetCourseExercisesQuery } = learningApi
