/* eslint-disable no-console */
import type { PhotoMeta } from '~/types/photo'
import { readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { encode } from 'blurhash'
import { imgRE } from '~/shared/constants'

const PHOTOS_DIR = resolve('public/photos')
const OUTPUT_FILE = resolve('public/photo-meta.json')
const COMPONENT_X = 4
const COMPONENT_Y = 3

async function generateBlurhash(imagePath: string): Promise<string | null> {
  // Dynamic import to avoid issues when sharp isn't available
  const sharp = (await import('sharp')).default

  const { data, info } = await sharp(imagePath)
    .resize(32, 32, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const pixels = new Uint8ClampedArray(data)
  const { width, height } = info

  return encode(pixels, width, height, COMPONENT_X, COMPONENT_Y)
}

async function generatePhotoMeta(): Promise<Record<string, PhotoMeta>> {
  const files = readdirSync(PHOTOS_DIR).filter(f => imgRE.test(f))

  const meta: Record<string, PhotoMeta> = {}

  for (const file of files) {
    const imagePath = join(PHOTOS_DIR, file)
    const name = file.replace(imgRE, '')

    try {
      const blurhash = await generateBlurhash(imagePath)
      meta[name] = { blurhash: blurhash || undefined }
    }
    catch (error) {
      console.error(`Failed to generate blurhash for ${file}:`, error)
      meta[name] = {}
    }
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(meta, null, 2))
  console.log(`Generated photo-meta.json with ${Object.keys(meta).length} entries`)

  return meta
}

// Run directly if executed as script
if (import.meta.url === `file://${process.argv[1]}`) {
  generatePhotoMeta()
    .then(() => console.log('Done'))
    .catch(console.error)
}
