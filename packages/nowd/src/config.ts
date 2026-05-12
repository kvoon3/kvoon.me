import process from 'node:process'
import { stringToBoolean } from './utils'

export interface AppConfig {
  apiUrl: string
  includeAppIcon: boolean
  includeWindowTitle: boolean
}

export function loadConfig(): AppConfig {
  const includeAppIcon = process.env.NOWD_INCLUDE_APP_ICON
    ?? process.env.NOWD_SYNC_APP_ICONS

  return {
    apiUrl: process.env.NOWD_API_URL ?? 'http://localhost:3000/api/activity',
    includeAppIcon: stringToBoolean(includeAppIcon, false),
    includeWindowTitle: stringToBoolean(process.env.NOWD_INCLUDE_WINDOW_TITLE, false),
  }
}
