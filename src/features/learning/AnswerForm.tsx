import { useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useNavigation } from 'react-router'
import { isAttemptExerciseId } from '../../shared/ids'
import { Button } from '../../shared/Button'
import { ErrorMessage, StatusMessage } from '../../shared/Status'
import { useAppDispatch } from '../../shared/storeHooks'
import { answerValidationMessage, maxAnswerLength } from './answerValidation'
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
  const [validated, setValidated] = useState(false)
  const answerInput = useRef<HTMLTextAreaElement>(null)
  const validation = validated ? answerValidationMessage(answer) : undefined
  const active = useRef(false)
  const submitting = workflow.status === 'pending'
  const savingDecision = workflow.status === 'confirmed' && workflow.decision.status === 'pending'
  const disabled = !canSubmit || navigationState !== 'idle'

  useLayoutEffect(() => {
    active.current = navigationState === 'idle'
    return () => {
      active.current = false
    }
  }, [navigationState])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!active.current || disabled) return
    setValidated(true)
    if (answerValidationMessage(answer)) {
      answerInput.current?.focus()
      return
    }
    const confirmed = await dispatch(checkAnswer(scope, answer))
    // Redux can finish the originating exercise after navigation. Only the mounted form may navigate.
    if (confirmed && active.current) void navigate('result')
  }

  return (
    <section className="panel">
      <h1>Diagnostic exercise</h1>
      <p id="exercise-prompt" className="prompt">
        {exercise.prompt}
      </p>
      {isAttemptExerciseId(scope.exerciseId) ? (
        <form noValidate onSubmit={(event) => void handleSubmit(event)}>
          <label htmlFor="answer">Your answer (required)</label>
          <p className="hint" id="answer-instructions">
            Follow the prompt above. Use up to 5,000 characters.
          </p>
          <textarea
            ref={answerInput}
            id="answer"
            aria-describedby={
              validation
                ? 'exercise-prompt answer-instructions answer-error'
                : 'exercise-prompt answer-instructions'
            }
            aria-invalid={validation ? true : undefined}
            value={answer}
            maxLength={maxAnswerLength}
            rows={5}
            required
            disabled={submitting || savingDecision}
            onChange={(event) => {
              setAnswer(event.target.value)
              dispatch(workflowActions.clearAnswerFeedback(scope))
            }}
          />
          {validation && <ErrorMessage id="answer-error" message={validation} />}
          <Button variant="primary" type="submit" disabled={disabled}>
            {submitting ? 'Checking…' : 'Check my answer'}
          </Button>
          {submitting && <StatusMessage>Checking your answer…</StatusMessage>}
        </form>
      ) : (
        <ErrorMessage message="This exercise cannot be submitted." />
      )}
      {workflow.status === 'failed' && <ErrorMessage message={workflow.error.message} />}
      {workflow.status === 'ambiguous' && (
        <ErrorMessage message="We could not confirm whether this answer was saved. Submission for this exercise is paused in this tab. You can return to the course and continue with another exercise." />
      )}
      {workflow.status === 'uncertain' && (
        <div role="status" className="status-message status-message--warning">
          <h2>Answer needs clarification</h2>
          <p>{workflow.error.message}</p>
        </div>
      )}
      {savingDecision && <StatusMessage>Saving your previous recommendation decision…</StatusMessage>}
      {workflow.status === 'confirmed' && (
        <p>
          <Link className="back-link" to="result">
            View this session’s result
          </Link>
        </p>
      )}
    </section>
  )
}
