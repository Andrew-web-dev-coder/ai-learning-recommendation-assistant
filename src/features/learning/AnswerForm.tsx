import { useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useNavigation } from 'react-router'
import { isAttemptExerciseId } from '../../shared/ids'
import { ErrorMessage } from '../../shared/Status'
import { submitAttempt, type Exercise } from './api'
import { useDiagnosticSession } from './session'

export function AnswerForm({ exercise }: { exercise: Exercise }) {
  const { exerciseId, assessment, savingDecision, setAssessment } = useDiagnosticSession()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [uncertain, setUncertain] = useState(false)
  const active = useRef(false)
  const attemptInFlight = useRef(false)

  useLayoutEffect(() => {
    active.current = navigation.state === 'idle'
    return () => { active.current = false }
  }, [navigation.state])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!active.current || !answer.trim() || answer.length > 5000 || savingDecision || attemptInFlight.current) return

    attemptInFlight.current = true
    setSubmitting(true)
    setError('')
    setUncertain(false)
    setAssessment(null)
    try {
      const outcome = await submitAttempt(exerciseId, answer)
      if (!active.current) return
      if (outcome.status === 'uncertain') {
        setUncertain(true)
        return
      }
      setAssessment(outcome)
      void navigate('result')
    } catch (error) {
      if (active.current) setError(error instanceof Error ? error.message : 'Failed to check the answer.')
    } finally {
      attemptInFlight.current = false
      setSubmitting(false)
    }
  }

  return (
    <section className="panel">
      <h2>Diagnostic exercise</h2>
      <p className="prompt">{exercise.prompt}</p>
      {isAttemptExerciseId(exerciseId) ? (
        <form onSubmit={(event) => void handleSubmit(event)}>
          <label htmlFor="answer">Explain your answer in your own words.</label>
          <textarea
            id="answer"
            value={answer}
            maxLength={5000}
            rows={5}
            required
            disabled={submitting || Boolean(savingDecision)}
            onChange={(event) => {
              setAnswer(event.target.value)
              setError('')
              setUncertain(false)
            }}
          />
          <button
            className="primary-button"
            disabled={submitting || Boolean(savingDecision) || !answer.trim()}
          >
            {submitting ? 'Checking…' : 'Check my answer'}
          </button>
        </form>
      ) : <ErrorMessage message="This exercise cannot be submitted." />}
      {error && <ErrorMessage message={error} />}
      {uncertain && (
        <div role="status">
          <h3>Answer needs clarification</h3>
          <p>The system could not classify this answer. Try explaining the concept more clearly.</p>
        </div>
      )}
      {savingDecision && <p role="status">Saving your previous recommendation decision…</p>}
      {assessment && <p><Link to="result">View this session’s result</Link></p>}
    </section>
  )
}
