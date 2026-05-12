import type { ActivitySnapshot } from './types'

const appIconHelperPath = new URL('../native/app-icon.swift', import.meta.url).pathname
const appIconDataUrlCache = new Map<string, string>()

const FRONTMOST_APP_SCRIPT = `
tell application "System Events"
  return name of first application process whose frontmost is true
end tell
`.trim()

const FRONTMOST_APP_PATH_SCRIPT = `
try
  tell application "System Events"
    return POSIX path of (application file of first application process whose frontmost is true)
  end tell
on error
  return ""
end try
`.trim()

const FRONT_WINDOW_TITLE_SCRIPT = `
try
  tell application "System Events"
    tell first application process whose frontmost is true
      if (count of windows) is 0 then return ""
      return name of front window
    end tell
  end tell
on error
  return ""
end try
`.trim()

async function runAppleScript(script: string): Promise<string | undefined> {
  const process = Bun.spawn(['osascript', '-e', script], {
    stdout: 'pipe',
    stderr: 'pipe',
  })

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
    process.exited,
  ])

  if (exitCode !== 0) {
    const message = stderr.trim()
    if (message)
      console.error(`[osascript] ${message}`)
    return undefined
  }

  const output = stdout.trim()
  return output || undefined
}

async function getAppIconDataUrl(appPath: string): Promise<string | undefined> {
  const cached = appIconDataUrlCache.get(appPath)
  if (cached)
    return cached

  const process = Bun.spawn(['xcrun', 'swift', appIconHelperPath, appPath], {
    stdout: 'pipe',
    stderr: 'pipe',
  })

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
    process.exited,
  ])

  if (exitCode !== 0) {
    const message = stderr.trim()
    if (message)
      console.error(`[app-icon] ${message}`)
    return undefined
  }

  const base64Png = stdout.trim()
  if (!base64Png)
    return undefined

  const dataUrl = `data:image/png;base64,${base64Png}`
  appIconDataUrlCache.set(appPath, dataUrl)
  return dataUrl
}

export async function getActivitySnapshot(): Promise<ActivitySnapshot | undefined> {
  const appName = await runAppleScript(FRONTMOST_APP_SCRIPT)
  if (!appName)
    return undefined

  const [appPath, windowTitle] = await Promise.all([
    runAppleScript(FRONTMOST_APP_PATH_SCRIPT),
    runAppleScript(FRONT_WINDOW_TITLE_SCRIPT),
  ])
  const appIconDataUrl = appPath ? await getAppIconDataUrl(appPath) : undefined

  return {
    appName,
    ...(appIconDataUrl ? { appIconDataUrl } : {}),
    ...(windowTitle ? { windowTitle } : {}),
    timestamp: new Date().toISOString(),
  }
}
