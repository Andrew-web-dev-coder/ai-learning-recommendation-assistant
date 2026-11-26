import { isAttemptExerciseId } from '../../shared/ids'

const apiOrigin = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
const demoLearnerId = 1

export interface Course {
  course_id: string
  course_code: string
  title: string
}

export interface Topic {
  topic_id: string
  title: string
}

export interface Exercise {
  exercise_id: string
  topic_id: string
  prompt: string
}

export type Decision = 'accepted' | 'rejected'

interface Recommendation {
  recommendation_id: string
  topic_title: string
  explanation: string
  learner_decision: 'pending' | Decision
}

export type Assessment =
  | { status: 'ok'; assessment_status: 'correct'; attempt_id: string; recommendation: null }
  | { status: 'ok'; assessment_status: 'incorrect'; attempt_id: string; recommendation: Recommendation }

interface Uncertain {
  status: 'uncertain'
  assessment_status: 'uncertain'
  message: string
}

async function request<T>(
  path: string,
  fallback: string,
  init: RequestInit,
  handleUncertain = false,
): Promise<T> {
  const response = await fetch(`${apiOrigin}${path}`, init).catch((error: unknown) => {
    if (init.signal?.aborted) throw error
    throw new Error(fallback)
  })
  const json = response.headers.get('content-type')?.includes('application/json')
  const data: unknown = json
    ? await response.json().catch(() => null)
    : null

  if (data && typeof data === 'object' && 'status' in data) {
    if (response.ok && data.status === 'ok') return data as T
    if (handleUncertain && response.status === 422 && data.status === 'uncertain') return data as T
    if (data.status === 'error' && 'message' in data && typeof data.message === 'string') {
      throw new Error(data.message)
    }
  }

  throw new Error(fallback)
}

export async function getCourses(signal: AbortSignal) {
  const data = await request<{ status: 'ok'; courses: Course[] }>(
    '/api/courses', 'Failed to load courses.', { signal },
  )
  return data.courses
}

export async function getCourse(courseId: string, signal: AbortSignal) {
  const [courses, topics, exercises] = await Promise.all([
    getCourses(signal),
    request<{ status: 'ok'; topics: Topic[] }>(
      `/api/courses/${courseId}/topics`, 'Failed to load topics.', { signal },
    ),
    getExercises(courseId, signal),
  ])

  return {
    course: courses.find((course) => course.course_id === courseId),
    topics: topics.topics,
    exercises,
  }
}

export async function getExercises(courseId: string, signal: AbortSignal) {
  const data = await request<{ status: 'ok'; exercises: Exercise[] }>(
    `/api/courses/${courseId}/exercises`, 'Failed to load exercises.', { signal },
  )
  return data.exercises
}

export async function submitAttempt(exerciseId: string, answer: string) {
  if (!isAttemptExerciseId(exerciseId)) throw new Error('This exercise cannot be submitted.')

  const outcome = await request<Assessment | Uncertain>('/api/attempts', 'Failed to check the answer.', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      learner_id: demoLearnerId,
      exercise_id: Number(exerciseId),
      submitted_answer: answer,
    }),
  }, true)
  if (outcome.status === 'uncertain') return outcome
  if (typeof outcome.attempt_id !== 'string' ||
      !((outcome.assessment_status === 'correct' && outcome.recommendation === null) ||
        (outcome.assessment_status === 'incorrect' && outcome.recommendation?.learner_decision === 'pending'))) {
    throw new Error('The assessment result could not be confirmed.')
  }
  return outcome
}

export async function submitDecision(
  recommendationId: string,
  attemptId: string,
  decision: Decision,
) {
  const data = await request<{
    status: 'ok'
    recommendation: { recommendation_id: string; attempt_id: string; learner_decision: Decision }
  }>(`/api/recommendations/${recommendationId}/decision`, 'Failed to save the decision.', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision }),
  })
  const saved = data.recommendation
  if (saved?.recommendation_id !== recommendationId || saved.attempt_id !== attemptId ||
      (saved.learner_decision !== 'accepted' && saved.learner_decision !== 'rejected')) {
    throw new Error('The saved decision could not be confirmed.')
  }
  return saved.learner_decision
}
