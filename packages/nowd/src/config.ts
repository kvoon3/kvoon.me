import process from 'node:process'

export interface AppConfig {
  apiUrl: string
  includeAppIcon: boolean
  includeWindowTitle: boolean
}

export function loadConfig(): AppConfig {
  return {
    apiUrl: process.env.NOWD_API_URL ?? 'http://localhost:3000/api/activity',
    includeAppIcon: process.env.NOWD_INCLUDE_APP_ICON !== 'false',
    includeWindowTitle: process.env.NOWD_INCLUDE_WINDOW_TITLE !== 'false',
  }
}
