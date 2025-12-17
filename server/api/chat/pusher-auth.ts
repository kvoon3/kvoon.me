export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const socketId = body.socket_id as string
  const channelName = body.channel_name as string

  if (!socketId || !channelName) {
    throw createError({
      statusCode: 400,
      message: 'Missing required Pusher parameters',
    })
  }

  const { username } = event.context.user

  // For presence channels, need to provide user data
  const presenceData = {
    user_id: username,
    user_info: {
      name: username,
    },
  }

  // Generate authentication response
  const authResponse = pusher?.authorizeChannel(socketId, channelName, presenceData)
  return authResponse
})
