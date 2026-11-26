import { Link } from 'react-router'
import { AssessmentResult } from '../features/learning/AssessmentResult'
import { useDiagnosticSession } from '../features/learning/session'

export function Component() {
  const { assessment } = useDiagnosticSession()
  return (
    <>
      <p><Link to="..">Back to diagnostic</Link></p>
      {assessment ? <AssessmentResult /> : (
        <section className="panel">
          <h2>Result unavailable</h2>
          <p>Results are only available during the current diagnostic session. Return to the diagnostic to continue.</p>
        </section>
      )}
    </>
  )
}
