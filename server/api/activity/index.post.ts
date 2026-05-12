import type { ActivityPayload } from '~~/types/activity'
import { setLatestActivity } from '../../utils/activity-store'

export default defineEventHandler(async (event): Promise<ActivityPayload> => {
  const activity = await readBody<ActivityPayload>(event)

  await setLatestActivity(activity)

  return activity
})
