export interface ChatMessageEvent {
  id: string
  username: string
  content: string
  timestamp: number
  channelId?: string
  isAI?: boolean
  isPending?: boolean
}

export interface UserJoinedEvent {
  username: string
  timestamp: number
}

export interface UserLeftEvent {
  username: string
  timestamp: number
}

export interface UserTypingEvent {
  username: string
  isTyping: boolean
}

export const PUSHER_EVENTS = {
  CHAT_MESSAGE: 'chat-message',
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
  USER_TYPING: 'user-typing',
} as const

export const channels = [
  {
    id: 'GENERAL',
    name: 'General',
    pusherKey: 'presence-chatroom-general',
  },
  {
    id: 'RANDOM',
    name: 'Random',
    pusherKey: 'presence-chatroom-random',
  },
  {
    id: 'HELP',
    name: 'Help',
    pusherKey: 'presence-chatroom-help',
  },
] as const

export type ChannelId = typeof channels[number]['id']

export function getChannelById(id: ChannelId) {
  return channels.find(channel => channel.id === id)
}

export function getPusherChannelName(channelId: ChannelId): string {
  const channel = getChannelById(channelId)
  if (!channel) {
    throw new Error(`Channel not found: ${channelId}`)
  }
  return channel.pusherKey
}

export interface PusherEventMap {
  [PUSHER_EVENTS.CHAT_MESSAGE]: ChatMessageEvent
  [PUSHER_EVENTS.USER_JOINED]: UserJoinedEvent
  [PUSHER_EVENTS.USER_LEFT]: UserLeftEvent
  [PUSHER_EVENTS.USER_TYPING]: UserTypingEvent
}

export type PusherEventName = keyof PusherEventMap

export type PusherEventData<T extends PusherEventName> = PusherEventMap[T]
