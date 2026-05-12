import type { ActivityPayload } from '~~/types/activity'
import {
  getLatestActivity,
  subscribeToActivity,
} from '../../utils/activity-store'

export default defineEventHandler((event) => {
  const stream = createEventStream(event)

  const pushActivity = async (activity: ActivityPayload) => {
    await stream.push(JSON.stringify(activity))
  }

  const unsubscribe = subscribeToActivity(pushActivity)
  const latestActivity = getLatestActivity()

  if (latestActivity) {
    void pushActivity(latestActivity)
  }

  stream.onClosed(() => {
    unsubscribe()
  })

  return stream.send()
})
