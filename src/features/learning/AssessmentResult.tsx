import { useEffect, useRef } from 'react'
import { useAppDispatch } from '../../shared/storeHooks'
import { RecommendationCard } from './RecommendationCard'
import { useDiagnosticSession } from './session'
import { recordDecision } from './workflowActions'

export function AssessmentResult() {
  const { scope, workflow, canDecide } = useDiagnosticSession()
  const dispatch = useAppDispatch()
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    heading.current?.focus()
  }, [])

  if (workflow.status !== 'confirmed') return null

  const { assessment, decision } = workflow
  return (
    <section className="panel">
      <h1 ref={heading} tabIndex={-1}>
        {assessment.is_correct ? 'Correct answer' : 'Incorrect answer'}
      </h1>
      {assessment.is_correct ? (
        <p className="status-message status-message--success">{assessment.message}</p>
      ) : (
        <>
          <p>Your answer contains a recognized misconception.</p>
          <dl className="assessment-details">
            <dt>Error category ID</dt>
            <dd>{assessment.error_category_id}</dd>
          </dl>
          <RecommendationCard
            recommendation={assessment.recommendation}
            decision={decision}
            canDecide={canDecide}
            onDecide={(value) => void dispatch(recordDecision(scope, value))}
          />
        </>
      )}
    </section>
  )
}
