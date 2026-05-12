# nowd

Minimal macOS activity collector built with Bun and TypeScript.

## Run

```bash
bun install
bun run start
```

Optional environment variables:

```bash
NOWD_API_URL="http://localhost:3000/api/activity"
NOWD_INCLUDE_APP_ICON="true"
NOWD_INCLUDE_WINDOW_TITLE="true"
```

The CLI prints one JSON object per sample and sends the same payload to
`NOWD_API_URL` when configured:

```json
{
  "appName": "Code",
  "appIconDataUrl": "data:image/png;base64,...",
  "windowTitle": "README.md",
  "timestamp": "2026-05-12T02:30:00.000Z"
}
```

Window titles may be unavailable until macOS grants Accessibility permission to
the terminal or runtime that launches this process.

The collector is event-driven. It emits on:

- frontmost app changes
- focused window changes
- focused window title changes when Accessibility notifications are available

Duplicate states are skipped before upload. The default upload target is
`http://localhost:3000/api/activity`.

Set `NOWD_INCLUDE_WINDOW_TITLE=false` to omit `windowTitle` from the payload.
Set `NOWD_INCLUDE_APP_ICON=false` to omit `appIconDataUrl` from the payload.
