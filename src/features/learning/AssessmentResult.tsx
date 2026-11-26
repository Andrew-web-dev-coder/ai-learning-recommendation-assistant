import { ErrorMessage } from '../../shared/Status'
import { useDiagnosticSession } from './session'

export function AssessmentResult() {
  const { assessment, saveDecision, savingDecision, decisionError } = useDiagnosticSession()
  if (!assessment) return null

  const recommendation = assessment.recommendation
  const saved = recommendation && recommendation.learner_decision !== 'pending'
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
          {saved ? (
            <p className="feedback" role="status">Saved decision: <strong>{recommendation.learner_decision}</strong></p>
          ) : (
            <div className="actions">
              <button className="primary-button" disabled={Boolean(savingDecision)}
                onClick={() => void saveDecision('accepted')}>
                Accept
              </button>
              <button className="secondary-button" disabled={Boolean(savingDecision)}
                onClick={() => void saveDecision('rejected')}>
                Reject
              </button>
            </div>
          )}
          {savingDecision && <p role="status">Saving decision…</p>}
          {decisionError && <ErrorMessage message={decisionError} />}
        </>
      )}
    </section>
  )
}
