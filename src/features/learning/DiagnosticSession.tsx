import { useRef, useState } from 'react'
import { Link, Outlet, useParams } from 'react-router'
import { isPathId } from '../../shared/ids'
import { submitDecision, type Assessment, type Decision } from './api'
import type { DiagnosticSession as Session } from './session'

function SessionOutlet({ courseId, exerciseId }: Pick<Session, 'courseId' | 'exerciseId'>) {
  const [assessment, updateAssessment] = useState<Assessment | null>(null)
  const [savingDecision, setSavingDecision] = useState<Decision | null>(null)
  const [decisionError, setDecisionError] = useState('')
  const decisionInFlight = useRef(false)

  function setAssessment(next: Assessment | null) {
    updateAssessment(next)
    setDecisionError('')
  }

  async function saveDecision(decision: Decision) {
    const recommendation = assessment?.recommendation
    if (!assessment || recommendation?.learner_decision !== 'pending' || decisionInFlight.current) return

    const attemptId = assessment.attempt_id
    decisionInFlight.current = true
    setSavingDecision(decision)
    setDecisionError('')
    try {
      const saved = await submitDecision(recommendation.recommendation_id, attemptId, decision)
      updateAssessment((current) => {
        if (current?.attempt_id !== attemptId || !current.recommendation) return current
        return { ...current, recommendation: { ...current.recommendation, learner_decision: saved } }
      })
    } catch (error) {
      setDecisionError(error instanceof Error ? error.message : 'Failed to save the decision.')
    } finally {
      decisionInFlight.current = false
      setSavingDecision(null)
    }
  }

  const session: Session = {
    courseId, exerciseId, assessment, setAssessment, saveDecision, savingDecision, decisionError,
  }
  return <Outlet context={session} />
}

export default function DiagnosticSession() {
  const { courseId, exerciseId } = useParams()
  if (!isPathId(courseId) || !isPathId(exerciseId)) {
    return (
      <section className="panel">
        <h2>Invalid course or exercise address</h2>
        <Link to="/courses">Back to courses</Link>
      </section>
    )
  }

  return <SessionOutlet key={`${courseId}/${exerciseId}`} courseId={courseId} exerciseId={exerciseId} />
}
