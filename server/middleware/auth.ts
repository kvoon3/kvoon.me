export default defineEventHandler(async (event) => {
  // Only intercept API requests, not page routes
  if (!event.path.startsWith('/api/')) {
    return
  }

  // All APIs under /api/public/ don't require authentication
  if (event.path.startsWith('/api/public/')) {
    return
  }

  // Check authentication headers
  const headers = getHeaders(event)
  const username = headers['x-username'] as string
  const token = headers['x-token'] as string

  if (!username || !token) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required',
    })
  }

  const isValid = await verifyToken(username, token)

  if (!isValid) {
    throw createError({
      statusCode: 401,
      message: 'Authentication invalid or expired',
    })
  }

  // Add user information to event context
  event.context.user = { username, token }
})
