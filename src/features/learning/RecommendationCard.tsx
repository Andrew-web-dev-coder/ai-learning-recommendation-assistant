import { useLayoutEffect, useRef } from 'react'
import { Button } from '../../shared/Button'
import { ErrorMessage, StatusMessage } from '../../shared/Status'
import type { Assessment, Decision } from './api'
import type { DecisionState } from './workflowSlice'

interface RecommendationCardProps {
  recommendation: NonNullable<Assessment['recommendation']>
  decision: DecisionState
  canDecide: boolean
  onDecide: (decision: Decision) => void
}

export function RecommendationCard({
  recommendation,
  decision,
  canDecide,
  onDecide,
}: RecommendationCardProps) {
  const pending = decision.status === 'pending'
  const region = useRef<HTMLElement>(null)
  const submitted = useRef(false)

  useLayoutEffect(() => {
    if (!submitted.current || pending) return
    submitted.current = false
    if (!canDecide && document.activeElement === document.body) region.current?.focus()
  }, [canDecide, pending, decision.status])

  function decide(value: Decision) {
    submitted.current = true
    onDecide(value)
  }

  return (
    <section ref={region} tabIndex={-1} className="recommendation" aria-labelledby="recommendation-heading">
      <h2 id="recommendation-heading">Recommended next topic</h2>
      <p>
        <strong>{recommendation.topic_title}</strong>
      </p>
      {recommendation.explanation && <p>{recommendation.explanation}</p>}
      {(canDecide || pending) && (
        <div className="actions">
          <Button variant="primary" disabled={!canDecide} onClick={() => decide('accepted')}>
            Accept recommendation
          </Button>
          <Button disabled={!canDecide} onClick={() => decide('rejected')}>
            Reject recommendation
          </Button>
        </div>
      )}
      {pending && <StatusMessage>Saving your recommendation decision…</StatusMessage>}
      {decision.status === 'saved' && (
        <StatusMessage tone="success">
          Saved decision · <strong>{decision.value === 'accepted' ? 'Accepted' : 'Rejected'}</strong>
        </StatusMessage>
      )}
      {decision.status === 'conflict' && <ErrorMessage message={decision.error.message} />}
      {decision.status === 'failed' && (
        <ErrorMessage message={`Could not save your decision. ${decision.error.message}`} />
      )}
      {decision.status === 'ambiguous' && (
        <ErrorMessage message="We could not confirm whether the decision was saved. Decision controls are closed for this recommendation." />
      )}
    </section>
  )
}
