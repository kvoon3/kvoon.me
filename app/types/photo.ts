export interface PhotoMeta {
  text?: string
  blurhash?: string
  location?: [number, number]
}

export interface PhotoWithLocation {
  path: string
  location: [number, number]
  blurhash?: string
}
