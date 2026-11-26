import { useOutletContext } from 'react-router'
import { useAppSelector } from '../../shared/storeHooks'
import { selectWorkflow, selectWorkflowControls, type ExerciseScope } from './workflowSlice'

export function useExerciseScope() {
  return useOutletContext<ExerciseScope>()
}

export function useDiagnosticSession() {
  const scope = useExerciseScope()
  const workflow = useAppSelector((state) => selectWorkflow(state, scope))
  const controls = useAppSelector((state) => selectWorkflowControls(state, scope))
  return { scope, workflow, ...controls }
}
