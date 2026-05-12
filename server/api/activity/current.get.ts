import type { ActivityPayload } from '~~/types/activity'
import { getLatestActivity } from '../../utils/activity-store'

export default defineEventHandler((): ActivityPayload | null => {
  return getLatestActivity()
})
