export interface PhotoMeta {
  name?: string
  text?: string
  blurhash?: string
  rotate?: number
  location?: [number, number]
  place?: string
}

export interface PhotoWithLocation {
  path: string
  location: [number, number]
  blurhash?: string
  rotate?: number
  place?: string
  locationKey: string
}

export interface PhotoGridItem {
  name: string
  stem: string
  url: string
  locationKey?: string
  date: Date
}
