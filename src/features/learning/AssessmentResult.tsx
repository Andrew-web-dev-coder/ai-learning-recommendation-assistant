import { ErrorMessage } from '../../shared/Status'
import { useAppDispatch } from '../../shared/storeHooks'
import { useDiagnosticSession } from './session'
import { recordDecision } from './workflowActions'

export function AssessmentResult() {
  const { scope, workflow, canDecide } = useDiagnosticSession()
  const dispatch = useAppDispatch()
  if (workflow.status !== 'confirmed') return null

  const { assessment, decision } = workflow
  const recommendation = assessment.recommendation
  return (
    <section className="panel recommendation">
      {assessment.assessment_status === 'correct' ? (
        <>
          <h2>Correct answer!</h2>
          <p>Your answer matches an approved assessment pattern.</p>
        </>
      ) : (
        <>
          <h2>Learning opportunity identified</h2>
          <p>Your answer contains a recognized misconception.</p>
        </>
      )}
      {recommendation && (
        <>
          <h3>Recommended next topic: {recommendation.topic_title}</h3>
          <p>{recommendation.explanation}</p>
          {(canDecide || decision.status === 'pending') && (
            <div className="actions">
              <button className="primary-button" disabled={!canDecide}
                onClick={() => void dispatch(recordDecision(scope, 'accepted'))}>
                Accept
              </button>
              <button className="secondary-button" disabled={!canDecide}
                onClick={() => void dispatch(recordDecision(scope, 'rejected'))}>
                Reject
              </button>
            </div>
          )}
          {decision.status === 'saved' && (
            <p className="feedback" role="status">Saved decision: <strong>{decision.value}</strong></p>
          )}
          {decision.status === 'pending' && <p role="status">Saving decision…</p>}
          {(decision.status === 'conflict' || decision.status === 'failed') &&
            <ErrorMessage message={decision.error.message} />}
          {decision.status === 'ambiguous' && (
            <ErrorMessage message="We could not confirm whether the decision was saved. Decision controls are closed for this recommendation." />
          )}
        </>
      )}
    </section>
  )
}
