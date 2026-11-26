import { Button } from '../../shared/Button'
import { ErrorMessage, Loading } from '../../shared/Status'
import { queryErrorMessage } from './apiErrors'

export function QueryFeedback({
  isFetching,
  error,
  onRefresh,
}: {
  isFetching: boolean
  error: unknown
  onRefresh: () => void
}) {
  return (
    <>
      {isFetching && <Loading message="Refreshing…" />}
      {error && <ErrorMessage message={queryErrorMessage(error)} />}
      <Button disabled={isFetching} onClick={onRefresh}>
        {error ? 'Retry loading' : 'Refresh'}
      </Button>
    </>
  )
}
