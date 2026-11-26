import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAppStore } from '../../app/store'
import { learningApi } from './api'
import { normalizeApiError } from './apiErrors'
import { checkAnswer, recordDecision } from './workflowActions'
import { selectWorkflow, selectWorkflowControls, workflowActions } from './workflowSlice'

const python = { courseId: '1', exerciseId: '1' }
const lithuanian = { courseId: '2', exerciseId: '2' }
const { getHealth, getCourses, getCourseTopics, getCourseExercises } = learningApi.endpoints
const json = (body: object, status = 200) => Response.json(body, { status })
const ok = (properties: object) => json({ status: 'ok', ...properties })
const failure = (status: number, message = 'fixture error') => json({ status: 'error', message }, status)

function deferredResponse() {
  let resolve!: (response: Response) => void
  let reject!: (error: Error) => void
  const promise = new Promise<Response>((accept, fail) => {
    resolve = accept
    reject = fail
  })
  return { promise, resolve, reject }
}

const course = { course_id: '1', course_code: 'PYTHON', title: 'Introduction to Python' }

function incorrect(id: string, topic: string) {
  return json({
    status: 'ok', assessment_status: 'incorrect', is_correct: false,
    attempt_id: id, error_category_id: id,
    recommendation: {
      recommendation_id: id, recommendation_rule_id: id, topic_id: id,
      topic_title: topic, explanation: 'Fixture explanation', learner_decision: 'pending',
    },
  }, 201)
}

const correct = () => json({
  status: 'ok', assessment_status: 'correct', is_correct: true,
  attempt_id: '3', error_category_id: null, recommendation: null, message: 'Correct',
}, 201)

function saved(id: string, decision: 'accepted' | 'rejected') {
  return ok({ message: 'Saved', recommendation: { recommendation_id: id, attempt_id: id, learner_decision: decision } })
}

let store: ReturnType<typeof createAppStore>
const fetchMock = vi.fn<(request: Request) => Promise<Response>>()

beforeEach(() => {
  store = createAppStore()
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  store.dispatch(learningApi.util.resetApiState())
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('store and RTK Query cache', () => {
  it('deduplicates concurrent catalog reads and reuses cached data after unsubscribe', async () => {
    fetchMock.mockResolvedValueOnce(ok({ courses: [course] }))
    const one = store.dispatch(getCourses.initiate())
    const two = store.dispatch(getCourses.initiate())
    expect(getCourses.select()(store.getState())).toMatchObject({ isLoading: true })
    expect(await one.unwrap()).toEqual(await two.unwrap())
    one.unsubscribe()
    two.unsubscribe()

    const revisit = store.dispatch(getCourses.initiate())
    expect(await revisit.unwrap()).toMatchObject({ courses: [course] })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(new URL(fetchMock.mock.calls[0][0].url).pathname).toBe('/api/courses')
    revisit.unsubscribe()
  })

  it('keeps the last successful data during manual refetch and exposes the failed refresh', async () => {
    fetchMock.mockResolvedValueOnce(ok({ courses: [course] }))
      .mockResolvedValueOnce(new Response('<h1>Bad gateway</h1>', { status: 502, headers: { 'Content-Type': 'text/html' } }))
    const query = store.dispatch(getCourses.initiate())
    await query.unwrap()
    const refresh = query.refetch()
    const state = () => getCourses.select()(store.getState())
    expect(state()).toMatchObject({ status: 'pending', data: { courses: [course] } })
    await expect(refresh.unwrap()).rejects.toMatchObject({ kind: 'server', status: 502 })
    expect(state()).toMatchObject({ isError: true, data: { courses: [course] } })
    fetchMock.mockResolvedValueOnce(ok({ courses: [] }))
    await query.refetch().unwrap()
    expect(state()).toMatchObject({ isSuccess: true, data: { courses: [] } })
    query.unsubscribe()
  })

  it('evicts the health query when unused for 15 seconds', async () => {
    vi.useFakeTimers()
    fetchMock.mockImplementation(async () => ok({ database: 'fixture', message: 'Healthy' }))
    const query = store.dispatch(getHealth.initiate())
    await query.unwrap()
    expect(new URL(fetchMock.mock.calls[0][0].url).pathname).toBe('/api/health')
    query.unsubscribe()
    await vi.advanceTimersByTimeAsync(15_001)
    expect(getHealth.select()(store.getState()).isUninitialized).toBe(true)
    await store.dispatch(getHealth.initiate()).unwrap()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('invalidates only the stale exercise collection after a matching 404', async () => {
    const counts = new Map<string, number>()
    fetchMock.mockImplementation(async (request) => {
      const path = new URL(request.url).pathname
      const count = (counts.get(path) ?? 0) + 1
      counts.set(path, count)
      if (path === '/api/attempts') return failure(404, 'Active exercise not found')
      if (path.endsWith('/topics')) return ok({ course_id: '1', topics: [] })
      return ok({ course_id: path.split('/')[3], exercises: count === 1 ? [{ exercise_id: '1' }] : [] })
    })

    await Promise.all([
      store.dispatch(getCourseTopics.initiate('1')).unwrap(),
      store.dispatch(getCourseExercises.initiate('1')).unwrap(),
      store.dispatch(getCourseExercises.initiate('2')).unwrap(),
    ])
    await store.dispatch(checkAnswer(python, 'synthetic answer'))
    await vi.waitFor(() => expect(getCourseExercises.select('1')(store.getState()).data?.exercises).toEqual([]))
    expect(Object.fromEntries(counts)).toEqual({
      '/api/courses/1/topics': 1, '/api/courses/1/exercises': 2,
      '/api/courses/2/exercises': 1, '/api/attempts': 1,
    })
    expect(selectWorkflow(store.getState(), python)).toMatchObject({ status: 'failed', error: { kind: 'missing' } })
  })
})

describe('exercise-scoped writes', () => {
  it('deduplicates attempts and applies a delayed result only to its originating exercise', async () => {
    const pending = deferredResponse()
    fetchMock.mockImplementation(async (request) => {
      const body = await request.json()
      expect(body).toMatchObject({ learner_id: 1, submitted_answer: 'fixture' })
      return body.exercise_id === 1 ? pending.promise : correct()
    })
    const first = store.dispatch(checkAnswer(python, 'fixture'))
    const tapAgain = store.dispatch(checkAnswer(python, 'fixture'))
    expect(selectWorkflowControls(store.getState(), python).canSubmit).toBe(false)
    expect(await tapAgain).toBe(false)
    expect(await store.dispatch(checkAnswer(lithuanian, 'fixture'))).toBe(true)
    const other = selectWorkflow(store.getState(), lithuanian)

    pending.resolve(incorrect('1', 'Type Conversion'))
    expect(await first).toBe(true)
    expect(selectWorkflow(store.getState(), python)).toMatchObject({
      status: 'confirmed', assessment: { assessment_status: 'incorrect', recommendation: { topic_title: 'Type Conversion' } },
    })
    expect(selectWorkflow(store.getState(), lithuanian)).toBe(other)
    expect(other).toMatchObject({ status: 'confirmed', assessment: { recommendation: null } })
    expect(selectWorkflowControls(store.getState(), lithuanian).canDecide).toBe(false)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(store.getState().learningApi.mutations).toEqual({})
    expect(JSON.stringify(store.getState())).not.toContain('submitted_answer')
  })

  it.each([
    [python, 'Type Conversion', 'accepted'],
    [lithuanian, 'Accusative Case', 'rejected'],
  ] as const)('confirms the %j recommendation and makes one decision write', async (scope, topic, decision) => {
    const post = incorrect(scope.exerciseId, topic)
    const patch = deferredResponse()
    fetchMock.mockResolvedValueOnce(post).mockImplementationOnce(() => patch.promise)
    await store.dispatch(checkAnswer(scope, 'fixture'))
    const first = store.dispatch(recordDecision(scope, decision))
    await store.dispatch(recordDecision(scope, decision === 'accepted' ? 'rejected' : 'accepted'))
    expect(selectWorkflowControls(store.getState(), scope)).toEqual({ canSubmit: false, canDecide: false })
    patch.resolve(saved(scope.exerciseId, decision))
    await first

    expect(selectWorkflow(store.getState(), scope)).toMatchObject({
      status: 'confirmed', assessment: { recommendation: { topic_title: topic } },
      decision: { status: 'saved', value: decision },
    })
    expect(fetchMock.mock.calls.map(([request]) => request.method)).toEqual(['POST', 'PATCH'])
    const request = fetchMock.mock.calls[1][0]
    expect(new URL(request.url).pathname).toBe(`/api/recommendations/${scope.exerciseId}/decision`)
    expect(await request.json()).toEqual({ decision })
  })

  it('distinguishes uncertainty from missing setup and clears editable feedback', async () => {
    fetchMock.mockResolvedValueOnce(json({ status: 'uncertain', assessment_status: 'uncertain',
      recommendation: null, message: 'Uncertain' }, 422))
      .mockResolvedValueOnce(failure(422))
    await store.dispatch(checkAnswer(python, 'unclear'))
    expect(selectWorkflow(store.getState(), python)).toMatchObject({ status: 'uncertain' })
    const controls = selectWorkflowControls(store.getState(), python)
    expect(controls.canSubmit).toBe(true)
    expect(selectWorkflowControls(store.getState(), { ...python })).toBe(controls)

    store.dispatch(workflowActions.clearAnswerFeedback(python))
    expect(selectWorkflow(store.getState(), python)).toEqual({ status: 'idle' })
    await store.dispatch(checkAnswer(python, 'revised'))
    expect(selectWorkflow(store.getState(), python)).toMatchObject({ status: 'failed', error: { kind: 'configuration' } })
  })

  it('locks a conflicting decision and does not infer a winner', async () => {
    fetchMock.mockResolvedValueOnce(incorrect('1', 'Type Conversion'))
      .mockResolvedValueOnce(failure(409))
    await store.dispatch(checkAnswer(python, 'fixture'))
    await store.dispatch(recordDecision(python, 'accepted'))
    await store.dispatch(recordDecision(python, 'rejected'))
    expect(selectWorkflow(store.getState(), python)).toMatchObject({
      status: 'confirmed', decision: { status: 'conflict', error: { status: 409 } },
    })
    expect(selectWorkflowControls(store.getState(), python).canDecide).toBe(false)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not repeat a POST after transport loss or clearing the draft feedback', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('connection dropped'))
    expect(await store.dispatch(checkAnswer(python, 'fixture'))).toBe(false)
    expect(selectWorkflow(store.getState(), python)).toMatchObject({
      status: 'ambiguous', error: { kind: 'network' },
    })
    store.dispatch(workflowActions.clearAnswerFeedback(python))
    expect(await store.dispatch(checkAnswer(python, 'revised'))).toBe(false)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(selectWorkflowControls(store.getState(), lithuanian).canSubmit).toBe(true)
    expect(selectWorkflow(createAppStore().getState(), python).status).toBe('idle')
  })

  it('refuses to confirm a mismatched PATCH response', async () => {
    fetchMock.mockResolvedValueOnce(incorrect('1', 'Type Conversion'))
      .mockResolvedValueOnce(saved('2', 'accepted'))
    await store.dispatch(checkAnswer(python, 'fixture'))
    await store.dispatch(recordDecision(python, 'accepted'))
    expect(selectWorkflow(store.getState(), python)).toMatchObject({
      status: 'confirmed', decision: { status: 'ambiguous', error: { kind: 'response' } },
    })
    await store.dispatch(recordDecision(python, 'accepted'))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('leaves another exercise untouched when a delayed PATCH loses its response', async () => {
    const patch = deferredResponse()
    fetchMock.mockImplementation(async (request) => {
      if (request.method === 'PATCH') return patch.promise
      const body = await request.json()
      return body.exercise_id === 1 ? incorrect('1', 'Type Conversion') : correct()
    })
    await store.dispatch(checkAnswer(python, 'fixture'))
    const saving = store.dispatch(recordDecision(python, 'accepted'))
    await store.dispatch(checkAnswer(lithuanian, 'fixture'))
    const other = selectWorkflow(store.getState(), lithuanian)
    patch.reject(new TypeError('connection dropped'))
    await saving

    expect(selectWorkflow(store.getState(), python)).toMatchObject({
      status: 'confirmed', decision: { status: 'ambiguous', error: { kind: 'network' } },
    })
    expect(selectWorkflow(store.getState(), lithuanian)).toBe(other)
    await store.dispatch(recordDecision(python, 'accepted'))
    expect(fetchMock.mock.calls.map(([request]) => request.method)).toEqual(['POST', 'PATCH', 'POST'])
  })

  it('fails closed when a successful POST lacks the documented assessment', async () => {
    fetchMock.mockResolvedValueOnce(json({ status: 'ok' }, 201))
    await store.dispatch(checkAnswer(python, 'fixture'))
    expect(selectWorkflow(store.getState(), python)).toMatchObject({
      status: 'ambiguous', error: { kind: 'response', status: 201 },
    })
    expect(selectWorkflowControls(store.getState(), python).canSubmit).toBe(false)
  })

  it('keeps catalog cache hot across successful writes', async () => {
    fetchMock.mockResolvedValueOnce(ok({ course_id: '1', exercises: [] }))
      .mockResolvedValueOnce(incorrect('1', 'Type Conversion'))
      .mockResolvedValueOnce(saved('1', 'accepted'))
    await store.dispatch(getCourseExercises.initiate('1')).unwrap()
    await store.dispatch(checkAnswer(python, 'fixture'))
    await store.dispatch(recordDecision(python, 'accepted'))
    await store.dispatch(getCourseExercises.initiate('1')).unwrap()
    expect(fetchMock.mock.calls.map(([request]) => request.method)).toEqual(['GET', 'POST', 'PATCH'])
  })
})

describe('error normalization', () => {
  it.each([[400, 'invalid'], [401, 'access'], [403, 'access'], [404, 'missing'],
    [409, 'conflict'], [413, 'invalid'], [415, 'invalid'], [500, 'server']] as const)(
    'keeps HTTP %s even when the error body cannot be parsed',
    (status, kind) => expect(normalizeApiError({
      status: 'PARSING_ERROR', originalStatus: status, data: '<h1>private detail</h1>', error: 'parser detail',
    })).toMatchObject({ status, kind }),
  )

  it('treats timeout and malformed success as unconfirmed', () => {
    expect(normalizeApiError({ status: 'TIMEOUT_ERROR', error: 'fixture' }).kind).toBe('timeout')
    expect(normalizeApiError({ status: 'PARSING_ERROR', originalStatus: 201, data: '', error: 'fixture' }).kind)
      .toBe('response')
  })
})
