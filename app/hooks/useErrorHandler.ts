import { ApiError } from '@/lib/api-client'

export function useErrorHandler() {
  const handleError = (error: any): string => {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        return 'Your session has expired. Please log in again.'
      } else if (error.status === 403) {
        return 'You do not have permission to perform this action.'
      } else if (error.status === 404) {
        return 'The requested resource was not found.'
      } else if (error.status === 409) {
        return error.message || 'A conflict occurred. Please try again.'
      } else if (error.status === 400) {
        return error.message || 'Invalid request. Please check your input.'
      } else if (error.status >= 500) {
        return 'A server error occurred. Please try again later.'
      }
      return error.message || 'An error occurred.'
    }

    if (error instanceof Error) {
      return error.message
    }

    return 'An unexpected error occurred.'
  }

  return { handleError }
}
