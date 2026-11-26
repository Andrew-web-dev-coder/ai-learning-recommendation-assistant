import { Link } from 'react-router'
import { AssessmentResult } from '../features/learning/AssessmentResult'
import { useDiagnosticSession } from '../features/learning/session'

export function Component() {
  const { workflow } = useDiagnosticSession()
  return (
    <>
      <p>
        <Link className="back-link" to="..">
          Back to diagnostic
        </Link>
      </p>
      {workflow.status === 'confirmed' ? (
        <AssessmentResult />
      ) : (
        <section className="panel">
          <h1>Result unavailable</h1>
          <p>
            Results are only available during the current diagnostic session. Return to the diagnostic to
            continue.
          </p>
        </section>
      )}
    </>
  )
}
