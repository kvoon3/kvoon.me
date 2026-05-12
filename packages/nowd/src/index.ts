import type { ActivitySnapshot } from './types'
import process from 'node:process'
import { loadConfig } from './config'
import { watchForegroundAppEvents } from './events'
import { getActivitySnapshot } from './macos'
import { postSnapshot } from './reporter'

const config = loadConfig()
let lastReportedState: string | undefined
let cleaningUp = false

function describeSnapshot(snapshot: ActivitySnapshot): string {
  const details = [snapshot.appName || 'idle']
  if (snapshot.windowTitle)
    details.push(snapshot.windowTitle)
  return details.join(' :: ')
}

function toPayload(snapshot: ActivitySnapshot): ActivitySnapshot {
  return {
    appName: snapshot.appName,
    ...(config.includeAppIcon && snapshot.appIconDataUrl
      ? { appIconDataUrl: snapshot.appIconDataUrl }
      : {}),
    ...(config.includeWindowTitle && snapshot.windowTitle
      ? { windowTitle: snapshot.windowTitle }
      : {}),
    timestamp: snapshot.timestamp,
  }
}

function toStateKey(snapshot: ActivitySnapshot): string {
  return JSON.stringify({
    appName: snapshot.appName,
    ...(snapshot.windowTitle ? { windowTitle: snapshot.windowTitle } : {}),
  })
}

function idleSnapshot(): ActivitySnapshot {
  return { appName: '', timestamp: new Date().toISOString() }
}

async function collectOnce(): Promise<void> {
  const snapshot = await getActivitySnapshot()
  if (!snapshot) {
    console.error('[collector] Unable to read the frontmost app.')
    return
  }

  const payload = toPayload(snapshot)
  const nextState = toStateKey(payload)
  if (nextState === lastReportedState) {
    process.stdout.write(`[nowd] unchanged ${describeSnapshot(payload)}\n`)
    return
  }

  lastReportedState = nextState
  const uploaded = await postSnapshot(payload, config)
  if (!uploaded)
    return

  process.stdout.write(`[nowd] reported ${describeSnapshot(payload)}\n`)
}

async function signalIdle(): Promise<void> {
  if (cleaningUp)
    return
  cleaningUp = true

  await postSnapshot(idleSnapshot(), config)
  process.stdout.write('[nowd] reported idle\n')
  process.exit(0)
}

async function main(): Promise<void> {
  process.stdout.write(
    `[nowd] watching ${config.apiUrl} appIcon=${config.includeAppIcon} windowTitle=${config.includeWindowTitle}\n`,
  )

  process.on('SIGINT', () => void signalIdle())
  process.on('SIGTERM', () => void signalIdle())

  await collectOnce()

  for await (const _ of watchForegroundAppEvents()) {
    await collectOnce()
  }

  // watcher exited naturally (e.g. swift helper died) — also signal idle
  await signalIdle()
}

void main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exitCode = 1
})
