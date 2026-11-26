import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Assessment, Decision } from './api'
import type { ApiError } from './apiErrors'

export interface ExerciseScope {
  courseId: string
  exerciseId: string
}

type Failure = { status: 'failed' | 'ambiguous'; error: ApiError }
type DecisionOutcome =
  | Failure
  | { status: 'conflict'; error: ApiError }
  | { status: 'saved'; value: Decision }

type DecisionState = { status: 'idle' | 'pending' } | DecisionOutcome
type AttemptOutcome =
  | { status: 'uncertain'; error: ApiError }
  | Failure
  | { status: 'confirmed'; assessment: Assessment; decision: DecisionState }

type Workflow = { status: 'idle' | 'pending' } | AttemptOutcome
type WorkflowState = Partial<Record<string, Workflow>>
export interface WorkflowRoot { workflow: WorkflowState }

const idle: Workflow = { status: 'idle' }
const initialState: WorkflowState = {}

function keyOf({ courseId, exerciseId }: ExerciseScope) {
  return `${courseId}/${exerciseId}`
}

const workflow = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    attemptStarted(state, action: PayloadAction<ExerciseScope>) {
      state[keyOf(action.payload)] = { status: 'pending' }
    },
    attemptFinished(state, action: PayloadAction<{ scope: ExerciseScope; outcome: AttemptOutcome }>) {
      const key = keyOf(action.payload.scope)
      if (state[key]?.status === 'pending') state[key] = action.payload.outcome
    },
    decisionStarted(state, action: PayloadAction<ExerciseScope>) {
      const entry = state[keyOf(action.payload)]
      if (entry?.status === 'confirmed') entry.decision = { status: 'pending' }
    },
    decisionFinished(state, action: PayloadAction<{
      scope: ExerciseScope; attemptId: string; outcome: DecisionOutcome
    }>) {
      const entry = state[keyOf(action.payload.scope)]
      if (entry?.status === 'confirmed' && entry.assessment.attempt_id === action.payload.attemptId &&
          entry.decision.status === 'pending') {
        entry.decision = action.payload.outcome
      }
    },
    clearAnswerFeedback(state, action: PayloadAction<ExerciseScope>) {
      const key = keyOf(action.payload)
      const status = state[key]?.status
      if (status === 'failed' || status === 'uncertain') delete state[key]
    },
  },
})

export const workflowActions = workflow.actions
export const workflowReducer = workflow.reducer

export function selectWorkflow(state: WorkflowRoot, scope: ExerciseScope): Workflow {
  return state.workflow[keyOf(scope)] ?? idle
}

export const selectWorkflowControls = createSelector([selectWorkflow], (workflow) => {
  const decision = workflow.status === 'confirmed' ? workflow.decision : undefined
  return {
    canSubmit: workflow.status !== 'pending' && workflow.status !== 'ambiguous' &&
      decision?.status !== 'pending',
    canDecide: workflow.status === 'confirmed' && workflow.assessment.recommendation !== null &&
      (decision?.status === 'idle' ||
        (decision?.status === 'failed' && decision.error.kind !== 'missing')),
  }
})
