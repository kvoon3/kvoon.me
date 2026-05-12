import type { AppConfig } from './config'
import type { ActivitySnapshot } from './types'
import process from 'node:process'

export async function postSnapshot(snapshot: ActivitySnapshot, config: AppConfig): Promise<boolean> {
  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(snapshot),
    })

    if (response.ok)
      return true

    console.warn(`Upload failed: ${response.status} ${response.statusText}`)
    return false
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn(`Upload failed: ${message}`)
    return false
  }
}

export function printUploadSuccess(snapshot: ActivitySnapshot): void {
  process.stdout.write([
    'Uploaded activity:',
    `App: ${snapshot.appName}`,
    `Icon: ${snapshot.appIconDataUrl ?? 'Not Send'}`,
    `Window: ${snapshot.windowTitle ?? ''}`,
    '',
  ].join('\n'))
}
