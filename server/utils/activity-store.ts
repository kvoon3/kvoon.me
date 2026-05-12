import type { ActivityPayload } from '~~/types/activity'

type ActivityListener = (activity: ActivityPayload) => void | Promise<void>

let latestActivity: ActivityPayload | null = null
const listeners = new Set<ActivityListener>()

export function getLatestActivity(): ActivityPayload | null {
  return latestActivity
}

export async function setLatestActivity(activity: ActivityPayload): Promise<void> {
  latestActivity = activity

  await Promise.allSettled(
    [...listeners].map(listener => listener(activity)),
  )
}

export function subscribeToActivity(listener: ActivityListener): () => void {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}
