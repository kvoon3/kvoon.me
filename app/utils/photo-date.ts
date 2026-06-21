const filenameDateRE = /^p-(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-\d+-\d+/

/**
 * Parses the photo capture date encoded in the filename.
 * Filenames use the pattern `p-YYYY-MM-DD-HH-MM-SS-000-N.ext`.
 */
export function getPhotoDate(name: string): Date | undefined {
  const match = filenameDateRE.exec(name)
  if (!match)
    return undefined

  const [year, month, day, hour, minute, second] = match.slice(1).map(Number) as [number, number, number, number, number, number]
  const date = new Date(year, month - 1, day, hour, minute, second)
  return Number.isNaN(date.getTime()) ? undefined : date
}

/**
 * Formats a date as `YYYY-MM-DD` using the local timezone.
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parses a `YYYY-MM-DD` string into a local Date.
 * By default the time is set to midnight; pass `endOfDay: true` for 23:59:59.999.
 */
export function parseDate(value: string | string[] | null | undefined, endOfDay = false): Date | undefined {
  const normalized = Array.isArray(value) ? value[0] : value
  if (!normalized)
    return undefined

  const [year, month, day] = normalized.split('-').map(Number) as [number, number, number]
  if ([year, month, day].some(Number.isNaN))
    return undefined

  const date = endOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? undefined : date
}
