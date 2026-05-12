/**
 * Parse a boolean-like environment value with an explicit fallback.
 */
export function stringToBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined)
    return fallback

  return value === 'true'
}
