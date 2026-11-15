
import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:3001'
const LEARNER_ID = 1 // Temporary demo learner for MVP

interface Course {
  course_id: string
  course_code: string
  title: string
}

interface Exercise {
  exercise_id: string
  topic_id: string
  prompt: string
  exercise_type: string
  is_active: boolean
}

interface Recommendation {
  recommendation_id: string
  recommendation_rule_id: string
  topic_id: string
  topic_title: string
  explanation: string
  learner_decision: 'pending' | 'accepted' | 'rejected'
}

interface AttemptResult {
  status: 'ok' | 'uncertain' | 'error'
  assessment_status?: 'correct' | 'incorrect' | 'uncertain'
  attempt_id?: string
  is_correct?: boolean
  error_category_id?: string | null
  recommendation?: Recommendation | null
  message?: string
}

function App() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selectedExercise, setSelectedExercise] = useState('')
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<AttemptResult | null>(null)

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [savingDecision, setSavingDecision] = useState(false)

  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')

  // ==========================================
  // Load courses from backend
  // ==========================================

  useEffect(() => {
    const controller = new AbortController()

    async function loadCourses() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(
          `${API_URL}/api/courses`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error('Failed to load courses')
        }

        const data = await response.json()

        if (controller.signal.aborted) return

        setCourses(data.courses ?? [])
      } catch (err) {
        if (controller.signal.aborted) return

        setError(
          err instanceof Error
            ? err.message
            : 'Unexpected error',
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadCourses()

    return () => controller.abort()
  }, [])

  // ==========================================
  // Load exercises for selected course
  // ==========================================

  useEffect(() => {
    if (!selectedCourse) return

    const controller = new AbortController()

    async function loadExercises() {
      setLoading(true)

      try {
        const response = await fetch(
          `${API_URL}/api/courses/${selectedCourse}/exercises`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error('Failed to load exercises')
        }

        const data = await response.json()

        if (controller.signal.aborted) return

        setExercises(data.exercises ?? [])
      } catch (err) {
        if (controller.signal.aborted) return

        setError(
          err instanceof Error
            ? err.message
            : 'Unexpected error',
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadExercises()

    return () => controller.abort()
  }, [selectedCourse])

  // ==========================================
  // Handle course selection
  // ==========================================

  function handleCourseChange(courseId: string) {
    setSelectedCourse(courseId)

    // Reset dependent state when changing courses.
    // These updates happen in an event handler,
    // not synchronously inside useEffect.
    setExercises([])
    setSelectedExercise('')
    setAnswer('')
    setResult(null)
    setFeedback('')
    setError('')
  }

  // ==========================================
  // Submit diagnostic answer
  // ==========================================

  async function submitAnswer() {
    if (!selectedExercise || !answer.trim()) {
      setError(
        'Please select an exercise and enter your answer.',
      )
      return
    }

    setSubmitting(true)
    setError('')
    setResult(null)
    setFeedback('')

    try {
      const response = await fetch(
        `${API_URL}/api/attempts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            learner_id: LEARNER_ID,
            exercise_id: Number(selectedExercise),
            submitted_answer: answer,
          }),
        },
      )

      const data: AttemptResult = await response.json()

      // Uncertain answers may return a non-2xx status.
      if (data.status === 'uncertain') {
        setResult(data)
        return
      }

      if (!response.ok) {
        throw new Error(
          data.message ?? 'Assessment failed',
        )
      }

      setResult(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unexpected error',
      )
    } finally {
      setSubmitting(false)
    }
  }

  // ==========================================
  // Save Accept / Reject decision
  // ==========================================

  async function saveDecision(
    decision: 'accepted' | 'rejected',
  ) {
    if (!result?.recommendation || savingDecision) {
      return
    }

    if (
      result.recommendation.learner_decision !== 'pending'
    ) {
      return
    }

    const recommendationId =
      result.recommendation.recommendation_id

    setSavingDecision(true)
    setError('')
    setFeedback('')

    try {
      const response = await fetch(
        `${API_URL}/api/recommendations/${recommendationId}/decision`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            decision,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ?? 'Failed to save decision',
        )
      }

      // Update frontend only after successful API response.
      setResult((current) => {
        if (!current?.recommendation) {
          return current
        }

        if (
          current.recommendation.recommendation_id !==
          recommendationId
        ) {
          return current
        }

        return {
          ...current,
          recommendation: {
            ...current.recommendation,
            learner_decision: decision,
          },
        }
      })

      setFeedback(
        `Recommendation ${decision} and saved to PostgreSQL.`,
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unexpected error',
      )
    } finally {
      setSavingDecision(false)
    }
  }

  // ==========================================
  // Derived state
  // ==========================================

  const currentExercise = exercises.find(
    (exercise) =>
      String(exercise.exercise_id) === selectedExercise,
  )

  const assessmentStatus =
    result?.assessment_status ??
    (result?.status === 'uncertain'
      ? 'uncertain'
      : result?.is_correct === true
        ? 'correct'
        : result?.is_correct === false
          ? 'incorrect'
          : null)

  const recommendation = result?.recommendation

  const decisionAlreadySaved =
    recommendation?.learner_decision === 'accepted' ||
    recommendation?.learner_decision === 'rejected'

  // ==========================================
  // UI
  // ==========================================

  return (
    <main className="app">
      <header className="header">
        <span className="eyebrow">
          EHU AI-NATIVE PRACTICE
        </span>

        <h1>
          AI Learning Recommendation Assistant
        </h1>

        <p>
          Complete a diagnostic exercise, understand your
          mistakes, and discover what to learn next.
        </p>
      </header>

      {/* STEP 1: COURSE SELECTION */}

      <section className="panel">
        <h2>1. Choose your course</h2>

        <select
          value={selectedCourse}
          disabled={loading || submitting || savingDecision}
          onChange={(event) => {
            handleCourseChange(event.target.value)
          }}
        >
          <option value="">
            Select a course
          </option>

          {courses.map((course) => (
            <option
              key={course.course_id}
              value={course.course_id}
            >
              {course.title}
            </option>
          ))}
        </select>

        {loading && (
          <p className="hint">
            Loading...
          </p>
        )}
      </section>

      {/* STEP 2: EXERCISE SELECTION */}

      {selectedCourse && (
        <section className="panel">
          <h2>
            2. Select a diagnostic exercise
          </h2>

          {exercises.length === 0 && !loading ? (
            <p className="hint">
              No active exercises are available
              for this course.
            </p>
          ) : (
            <select
              value={selectedExercise}
              disabled={
                loading ||
                submitting ||
                savingDecision
              }
              onChange={(event) => {
                setSelectedExercise(event.target.value)
                setAnswer('')
                setResult(null)
                setFeedback('')
                setError('')
              }}
            >
              <option value="">
                Select an exercise
              </option>

              {exercises.map((exercise) => (
                <option
                  key={exercise.exercise_id}
                  value={exercise.exercise_id}
                >
                  Exercise {exercise.exercise_id}
                </option>
              ))}
            </select>
          )}

          {currentExercise && (
            <div className="topic-row">
              <div>
                <strong>
                  Diagnostic question
                </strong>

                <p>
                  {currentExercise.prompt}
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* STEP 3: ANSWER SUBMISSION */}

      {currentExercise && (
        <section className="panel">
          <h2>
            3. Submit your answer
          </h2>

          <p className="hint">
            Explain your answer in your own words.
          </p>

          <textarea
            value={answer}
            maxLength={5000}
            rows={5}
            disabled={submitting || savingDecision}
            placeholder="Type your answer here..."
            onChange={(event) => {
              setAnswer(event.target.value)
              setResult(null)
              setFeedback('')
              setError('')
            }}
            style={{
              width: '100%',
              padding: '12px',
              boxSizing: 'border-box',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          />

          <button
            className="primary-button"
            disabled={
              submitting ||
              savingDecision ||
              !answer.trim()
            }
            onClick={() => void submitAnswer()}
          >
            {submitting
              ? 'Checking...'
              : 'Check my answer'}
          </button>
        </section>
      )}

      {/* ERROR MESSAGE */}

      {error && (
        <section className="panel">
          <h2>
            Something went wrong
          </h2>

          <p role="alert">
            {error}
          </p>
        </section>
      )}

      {/* STEP 4: ASSESSMENT RESULT */}

      {result && (
        <section className="panel recommendation">
          <span className="eyebrow">
            ASSESSMENT RESULT
          </span>

          {assessmentStatus === 'correct' && (
            <>
              <h2>
                Correct answer!
              </h2>

              <p>
                Your answer matches an approved
                assessment pattern.
              </p>
            </>
          )}

          {assessmentStatus === 'incorrect' && (
            <>
              <h2>
                Learning opportunity identified
              </h2>

              <p>
                Your answer contains a recognized
                misconception. Review the recommended
                topic below.
              </p>
            </>
          )}

          {assessmentStatus === 'uncertain' && (
            <>
              <h2>
                Answer needs clarification
              </h2>

              <p>
                The system cannot classify your answer
                with sufficient confidence.
              </p>

              <p>
                Try explaining the specific programming
                or grammar concept more clearly.
              </p>
            </>
          )}

          {/* STEP 5: RECOMMENDATION */}

          {recommendation && (
            <div className="topic-row">
              <div>
                <span className="eyebrow">
                  RECOMMENDED NEXT TOPIC
                </span>

                <h2>
                  {recommendation.topic_title}
                </h2>

                <p>
                  {recommendation.explanation}
                </p>
              </div>
            </div>
          )}

          {/* STEP 6: ACCEPT / REJECT */}

          {recommendation && (
            <div className="actions">
              <button
                className="primary-button"
                disabled={
                  savingDecision ||
                  decisionAlreadySaved
                }
                onClick={() =>
                  void saveDecision('accepted')
                }
              >
                {savingDecision
                  ? 'Saving...'
                  : 'Accept'}
              </button>

              <button
                className="secondary-button"
                disabled={
                  savingDecision ||
                  decisionAlreadySaved
                }
                onClick={() =>
                  void saveDecision('rejected')
                }
              >
                Reject
              </button>
            </div>
          )}

          {recommendation && decisionAlreadySaved && (
            <p className="feedback">
              Saved decision:{' '}
              <strong>
                {recommendation.learner_decision}
              </strong>
            </p>
          )}

          {feedback && (
            <p className="feedback" role="status">
              {feedback}
            </p>
          )}
        </section>
      )}

      <footer>
        Prototype · Deterministic learning
        recommendations · 2026
      </footer>
    </main>
  )
}

export default App
