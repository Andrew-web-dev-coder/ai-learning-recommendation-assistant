import { answerValidationMessage } from './answerValidation'
import type { ThunkAction, UnknownAction } from '@reduxjs/toolkit'
import { isAttemptExerciseId, isPathId } from '../../shared/ids'
import { learningApi, type Decision } from './api'
import { mayHaveCommitted, unexpectedResponse, type ApiError } from './apiErrors'
import { selectWorkflow, selectWorkflowControls, workflowActions,
  type ExerciseScope, type WorkflowRoot } from './workflowSlice'

type WorkflowThunk<Result> = ThunkAction<Promise<Result>, WorkflowRoot, unknown, UnknownAction>

export function checkAnswer(scope: ExerciseScope, answer: string): WorkflowThunk<boolean> {
  return async (dispatch, getState) => {
    if (!isPathId(scope.courseId) || !isAttemptExerciseId(scope.exerciseId) ||
        answerValidationMessage(answer) || !selectWorkflowControls(getState(), scope).canSubmit) {
      return false
    }

    // Claim this exercise synchronously before dispatching the HTTP mutation.
    dispatch(workflowActions.attemptStarted(scope))
    const response = await dispatch(learningApi.endpoints.submitAttempt.initiate(
      { ...scope, answer }, { track: false },
    ))
    if (response.data) {
      dispatch(workflowActions.attemptFinished({
        scope,
        outcome: { status: 'confirmed', assessment: response.data, decision: { status: 'idle' } },
      }))
      return true
    }

    const error: ApiError = 'kind' in response.error ? response.error : unexpectedResponse()
    dispatch(workflowActions.attemptFinished({
      scope,
      outcome: {
        status: error.kind === 'uncertain' ? 'uncertain' : mayHaveCommitted(error) ? 'ambiguous' : 'failed',
        error,
      },
    }))
    return false
  }
}

export function recordDecision(scope: ExerciseScope, decision: Decision): WorkflowThunk<void> {
  return async (dispatch, getState) => {
    const state = getState()
    const entry = selectWorkflow(state, scope)
    if (!selectWorkflowControls(state, scope).canDecide || entry.status !== 'confirmed' ||
        !entry.assessment.recommendation) return

    const attemptId = entry.assessment.attempt_id
    const recommendationId = entry.assessment.recommendation.recommendation_id
    dispatch(workflowActions.decisionStarted(scope))
    const response = await dispatch(learningApi.endpoints.saveDecision.initiate(
      { attemptId, recommendationId, decision }, { track: false },
    ))
    if (response.data) {
      dispatch(workflowActions.decisionFinished({
        scope, attemptId,
        outcome: { status: 'saved', value: response.data.recommendation.learner_decision },
      }))
      return
    }

    const error: ApiError = 'kind' in response.error ? response.error : unexpectedResponse()
    dispatch(workflowActions.decisionFinished({
      scope, attemptId,
      outcome: {
        status: error.kind === 'conflict' ? 'conflict' :
          mayHaveCommitted(error) ? 'ambiguous' : 'failed',
        error,
      },
    }))
  }
}
