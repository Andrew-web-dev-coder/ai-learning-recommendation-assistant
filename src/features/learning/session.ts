import { useOutletContext } from 'react-router'
import type { Assessment, Decision } from './api'

export interface DiagnosticSession {
  courseId: string
  exerciseId: string
  assessment: Assessment | null
  setAssessment: (assessment: Assessment | null) => void
  saveDecision: (decision: Decision) => Promise<void>
  savingDecision: Decision | null
  decisionError: string
}

export function useDiagnosticSession() {
  return useOutletContext<DiagnosticSession>()
}
