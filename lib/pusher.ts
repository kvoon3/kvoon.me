import Pusher from 'pusher'

// 检查环境变量
const pusherAppId = import.meta.env.PUSHER_APP_ID
const pusherKey = import.meta.env.PUSHER_KEY
const pusherSecret = import.meta.env.PUSHER_SECRET
const pusherCluster = import.meta.env.PUSHER_CLUSTER

if (!pusherAppId || !pusherKey || !pusherSecret || !pusherCluster) {
  console.warn('Pusher environment variables are not set. Real-time features will be disabled.')
}

// 创建 Pusher 实例（如果环境变量已设置）
export const pusher = pusherAppId && pusherKey && pusherSecret && pusherCluster
  ? new Pusher({
      appId: pusherAppId,
      key: pusherKey,
      secret: pusherSecret,
      cluster: pusherCluster,
      useTLS: true,
    })
  : null

// 聊天消息触发器
export async function triggerChatMessage(message: {
  id: string
  username: string
  content: string
  timestamp: number
}) {
  if (!pusher) {
    console.warn('Pusher is not configured. Message not sent:', message)
    return
  }

  try {
    await pusher.trigger('presence-chatroom', 'chat-message', message)
  }
  catch (error) {
    console.error('Failed to trigger chat message:', error)
  }
}

// 用户加入触发器
export async function triggerUserJoined(user: {
  username: string
  timestamp: number
}) {
  if (!pusher) {
    console.warn('Pusher is not configured. User join not triggered:', user)
    return
  }

  try {
    await pusher.trigger('presence-chatroom', 'user-joined', user)
  }
  catch (error) {
    console.error('Failed to trigger user joined:', error)
  }
}

// 用户离开触发器
export async function triggerUserLeft(user: {
  username: string
  timestamp: number
}) {
  if (!pusher) {
    console.warn('Pusher is not configured. User left not triggered:', user)
    return
  }

  try {
    await pusher.trigger('presence-chatroom', 'user-left', user)
  }
  catch (error) {
    console.error('Failed to trigger user left:', error)
  }
}

// 用户正在输入触发器
export async function triggerUserTyping(user: {
  username: string
  isTyping: boolean
}) {
  if (!pusher) {
    console.warn('Pusher is not configured. User typing not triggered:', user)
    return
  }

  try {
    await pusher.trigger('presence-chatroom', 'user-typing', user)
  }
  catch (error) {
    console.error('Failed to trigger user typing:', error)
  }
}
