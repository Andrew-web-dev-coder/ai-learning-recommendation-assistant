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

export function RecommendationCard({ recommendation, decision, canDecide, onDecide }: RecommendationCardProps) {
  const pending = decision.status === 'pending'

  return (
    <section className="recommendation" aria-labelledby="recommendation-heading">
      <h3 id="recommendation-heading">Recommended next topic</h3>
      <p><strong>{recommendation.topic_title}</strong></p>
      {recommendation.explanation && <p>{recommendation.explanation}</p>}
      {(canDecide || pending) && (
        <div className="actions">
          <Button variant="primary" disabled={!canDecide} onClick={() => onDecide('accepted')}>
            Accept recommendation
          </Button>
          <Button disabled={!canDecide} onClick={() => onDecide('rejected')}>
            Reject recommendation
          </Button>
        </div>
      )}
      {pending && <StatusMessage>Saving your recommendation decision…</StatusMessage>}
      {decision.status === 'saved' && (
        <StatusMessage>Saved decision · <strong>{decision.value === 'accepted' ? 'Accepted' : 'Rejected'}</strong></StatusMessage>
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
