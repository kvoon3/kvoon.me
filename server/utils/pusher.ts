import Pusher from 'pusher'

function createPusherInstance() {
  const config = useRuntimeConfig()

  return new Pusher({
    appId: config.pusherAppId,
    key: config.public.pusherKey,
    secret: config.pusherSecret,
    cluster: config.public.pusherCluster,
    useTLS: true,
  })
}

export const pusher = createPusherInstance()
