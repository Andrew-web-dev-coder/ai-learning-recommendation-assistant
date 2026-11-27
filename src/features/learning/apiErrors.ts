import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

export interface ApiError {
  kind: 'network' | 'timeout' | 'invalid' | 'access' | 'missing' | 'conflict' |
    'uncertain' | 'configuration' | 'server' | 'response'
  status?: number
  message: string
  staleExercise?: true
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function unexpectedResponse(status?: number): ApiError {
  return { kind: 'response', status, message: 'The service returned an unexpected response.' }
}

export function normalizeApiError(error: FetchBaseQueryError): ApiError {
  if (error.status === 'FETCH_ERROR') {
    return { kind: 'network', message: 'The service could not be reached. Check your connection.' }
  }
  if (error.status === 'TIMEOUT_ERROR') {
    return { kind: 'timeout', message: 'The service took too long to respond.' }
  }
  if (error.status === 'CUSTOM_ERROR') return unexpectedResponse()

  const status = error.status === 'PARSING_ERROR' ? error.originalStatus : error.status
  const body = isRecord(error.data) ? error.data : undefined
  const staleExercise = body?.status === 'error' && body.message === 'Active exercise not found'
  switch (status) {
    case 400: return { kind: 'invalid', status, message: 'The service rejected the request. Check your input.' }
    case 401: return { kind: 'access', status, message: 'The service requires authentication for this request. Return to Courses or contact the demo maintainer.' }
    case 403: return { kind: 'access', status, message: 'The service does not permit this request. Return to Courses and choose another exercise.' }
    case 404: return staleExercise
      ? { kind: 'missing', status, staleExercise: true, message: 'This exercise is no longer available.' }
      : { kind: 'missing', status, message: 'The requested resource was not found. Return to Courses and check your selection.' }
    case 409: return { kind: 'conflict', status, message: 'A decision was already recorded. The service does not say which decision was saved.' }
    case 413: return { kind: 'invalid', status, message: 'The request was too large.' }
    case 415: return { kind: 'invalid', status, message: 'The service did not accept the request format.' }
    case 422: return body?.status === 'uncertain' && body.assessment_status === 'uncertain' &&
        body.recommendation === null && typeof body.message === 'string'
      ? { kind: 'uncertain', status, message: 'The system could not classify this answer. Try explaining the concept more clearly.' }
      : { kind: 'configuration', status, message: 'Assessment is unavailable for this exercise. Contact the demo maintainer.' }
    default: return status >= 500
      ? { kind: 'server', status, message: 'The service encountered an error.' }
      : unexpectedResponse(status)
  }
}

export function mayHaveCommitted(error: ApiError) {
  return error.kind === 'network' || error.kind === 'timeout' ||
    error.kind === 'server' || error.kind === 'response'
}

export function queryErrorMessage(error: unknown) {
  return isRecord(error) && typeof error.kind === 'string' && typeof error.message === 'string'
    ? error.message
    : 'Could not load this data.'
}
