import { useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useNavigation } from 'react-router'
import { isAttemptExerciseId } from '../../shared/ids'
import { ErrorMessage } from '../../shared/Status'
import { useAppDispatch } from '../../shared/storeHooks'
import type { Exercise } from './api'
import { useDiagnosticSession } from './session'
import { checkAnswer } from './workflowActions'
import { workflowActions } from './workflowSlice'

export function AnswerForm({ exercise }: { exercise: Exercise }) {
  const { scope, workflow, canSubmit } = useDiagnosticSession()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { state: navigationState } = useNavigation()
  const [answer, setAnswer] = useState('')
  const active = useRef(false)
  const submitting = workflow.status === 'pending'
  const savingDecision = workflow.status === 'confirmed' && workflow.decision.status === 'pending'
  const disabled = !canSubmit || navigationState !== 'idle'

  useLayoutEffect(() => {
    active.current = navigationState === 'idle'
    return () => { active.current = false }
  }, [navigationState])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!active.current || disabled) return
    const confirmed = await dispatch(checkAnswer(scope, answer))
    // Redux can finish the originating exercise after navigation. Only the mounted form may navigate.
    if (confirmed && active.current) void navigate('result')
  }

  return (
    <section className="panel">
      <h2>Diagnostic exercise</h2>
      <p className="prompt">{exercise.prompt}</p>
      {isAttemptExerciseId(scope.exerciseId) ? (
        <form onSubmit={(event) => void handleSubmit(event)}>
          <label htmlFor="answer">Explain your answer in your own words.</label>
          <textarea
            id="answer"
            value={answer}
            maxLength={5000}
            rows={5}
            required
            disabled={submitting || savingDecision}
            onChange={(event) => {
              setAnswer(event.target.value)
              dispatch(workflowActions.clearAnswerFeedback(scope))
            }}
          />
          <button className="primary-button" disabled={disabled || !answer.trim()}>
            {submitting ? 'Checking…' : 'Check my answer'}
          </button>
        </form>
      ) : <ErrorMessage message="This exercise cannot be submitted." />}
      {workflow.status === 'failed' && <ErrorMessage message={workflow.error.message} />}
      {workflow.status === 'ambiguous' && (
        <ErrorMessage message="We could not confirm whether this answer was saved. Submission for this exercise is paused in this tab. You can return to the course and continue with another exercise." />
      )}
      {workflow.status === 'uncertain' && (
        <div role="status">
          <h3>Answer needs clarification</h3>
          <p>{workflow.error.message}</p>
        </div>
      )}
      {savingDecision && <p role="status">Saving your previous recommendation decision…</p>}
      {workflow.status === 'confirmed' && <p><Link to="result">View this session’s result</Link></p>}
    </section>
  )
}
