/**
 * Extract detailed error message from API response
 * Priority: detail > message > custom message > fallback
 */
export function getErrorMessage(error, fallback = 'An error occurred') {
  if (!error) return fallback

  // API error response with detail field (FastAPI standard)
  if (error.response?.data?.detail) {
    return String(error.response.data.detail)
  }

  // API error response with message field
  if (error.response?.data?.message) {
    return String(error.response.data.message)
  }

  // Axios error message
  if (error.message) {
    return String(error.message)
  }

  return fallback
}

/**
 * Format error message for user display
 * Removes technical details, makes it user-friendly
 */
export function formatErrorMessage(errorMsg) {
  if (!errorMsg) return 'An unexpected error occurred'

  const msg = String(errorMsg).toLowerCase()

  // Map common backend errors to user-friendly messages
  const errorMap = {
    'duplicate': 'This item already exists',
    'not found': 'Item not found',
    'already exists': 'Already exists in database',
    'insufficient stock': 'Not enough stock available',
    'validation error': 'Invalid input',
    'unauthorized': 'You do not have permission',
    'forbidden': 'Access denied',
    'conflict': 'This conflicts with existing data',
  }

  for (const [key, friendlyMsg] of Object.entries(errorMap)) {
    if (msg.includes(key)) {
      return `${friendlyMsg}: ${errorMsg}`
    }
  }

  return errorMsg
}

/**
 * Extract and format complete error details
 */
export function extractError(error, fallback = 'An error occurred') {
  const rawMessage = getErrorMessage(error, fallback)
  return formatErrorMessage(rawMessage)
}
