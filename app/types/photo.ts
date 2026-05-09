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
}
