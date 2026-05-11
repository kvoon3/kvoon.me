import type { PhotoMeta } from '~/types/photo'

const PLACE_LABELS: Record<string, string> = {
  'bangkok': 'Bangkok',
  'foshan': 'Foshan',
  'Guangzhou': 'Guangzhou',
  'hengyang': 'Hengyang',
  'hengyang hunan': 'Hengyang',
  'hengyang, hunan': 'Hengyang',
  'Hengyang': 'Hengyang',
  'hongkong': 'Hong Kong',
  'hong kong': 'Hong Kong',
  'pattaya': 'Pattaya',
  'pattaya thailand': 'Pattaya',
  'pattaya, thailand': 'Pattaya',
  'shenzhen': 'Shenzhen',
}

function normalizePlaceLabel(place: string): string {
  const key = place.trim().toLowerCase().replace(/\s+/g, ' ')
  return PLACE_LABELS[key] ?? place.trim()
}

/**
 * Returns the standardized location bucket used by photo filters and overlays.
 */
export function getPhotoLocation(meta: Pick<PhotoMeta, 'location' | 'place'>): { key: string, label: string } | undefined {
  if (!meta.location)
    return

  const label = meta.place ? normalizePlaceLabel(meta.place) : 'Unsorted'
  return {
    key: label,
    label,
  }
}
