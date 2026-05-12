const helperPath = new URL('../native/foreground-events.swift', import.meta.url).pathname

async function* readLines(stream: ReadableStream<Uint8Array<ArrayBuffer>>): AsyncGenerator<string> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done)
      break

    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const normalized = line.trim()
      if (normalized)
        yield normalized
    }
  }

  const trailing = buffer.trim()
  if (trailing)
    yield trailing
}

export async function* watchForegroundAppEvents(): AsyncGenerator<void> {
  const process = Bun.spawn(['xcrun', 'swift', helperPath], {
    stdout: 'pipe',
    stderr: 'inherit',
  })

  for await (const event of readLines(process.stdout)) {
    if (event === 'ready')
      continue
    yield undefined
  }

  const exitCode = await process.exited
  throw new Error(`foreground event helper exited with code ${exitCode}`)
}
