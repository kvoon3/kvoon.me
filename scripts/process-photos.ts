import type { Tags } from 'exifreader'
import type { Buffer } from 'node:buffer'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { encode as blurhashEncode } from 'blurhash'
import ExifReader from 'exifreader'
import { basename, join, parse } from 'pathe'
import sharp from 'sharp'
import { glob } from 'tinyglobby'
import { compressSharp } from '../app/utils/img-compress'

interface ImageMeta {
  blurhash?: string
}

interface PhotoMeta extends ImageMeta {
  location?: [number, number]
  rotate?: number
  place?: string
  name?: string
  text?: string
}

const publicFolder = fileURLToPath(new URL('../public', import.meta.url))
const dataFolder = fileURLToPath(new URL('../app/data', import.meta.url))
const folder = join(publicFolder, 'photos')

function stringifyJson(data: unknown): string {
  return `${JSON.stringify(data, null, 2)}\n`
}

async function createBlurhash(buffer: Buffer): Promise<string> {
  const img = sharp(buffer)
  const { data, info } = await img
    .raw()
    .ensureAlpha()
    .resize(32, 32, { fit: 'cover' })
    .toBuffer({ resolveWithObject: true })
  return blurhashEncode(new Uint8ClampedArray(data), info.width, info.height, 4, 4)
}

async function ensureBlurhash(filepath: string, configFile = filepath.replace(/\.\w+$/, '.json'), force = false): Promise<void> {
  const config: ImageMeta = existsSync(configFile)
    ? JSON.parse(await fs.readFile(configFile, 'utf-8'))
    : {}

  if (config.blurhash && !force)
    return

  const buffer = await fs.readFile(filepath)
  config.blurhash = await createBlurhash(buffer)
  await fs.writeFile(configFile, stringifyJson(config))
}

let files = (await glob('**/*.{jpg,png,jpeg}', {
  caseSensitiveMatch: false,
  absolute: true,
  cwd: folder,
}))
  .sort((a, b) => a.localeCompare(b))

for (const filepath of files) {
  if (basename(filepath).startsWith('p-'))
    continue

  let writepath = filepath
  let { ext } = parse(filepath.toLowerCase())
  if (ext === '.jpeg')
    ext = '.jpg'
  const buffer = await fs.readFile(filepath)
  const img = await sharp(buffer)
  const exif = await ExifReader.load(buffer)

  let dateRaw = exif.DateTimeOriginal?.value || exif.DateTime?.value || exif.DateCreated?.value
  dateRaw ||= new Date(await fs.stat(filepath).then(stat => stat.birthtime || stat.mtime)).toISOString()
  if (Array.isArray(dateRaw))
    dateRaw = dateRaw[0] as string
  dateRaw = String(dateRaw)

  let date = new Date(dateRaw.replace(/:/g, (x, idx) => {
    if (idx < 10)
      return '-'
    return x
  }))
  if (Number.isNaN(+date))
    date = new Date()

  const timeDiff = Date.now() - +date
  if (timeDiff < 1000 * 60 * 60) {
    console.warn(`Date of ${filepath} is too recent: ${dateRaw}`)
    continue
  }

  const base = `p-${date.toISOString().replace(/[:.a-z]+/gi, '-')}`
  let index = 1
  while (existsSync(join(folder, `${base}${index}${ext}`.toLowerCase())))
    index++
  writepath = join(folder, `${base}${index}${ext}`.toLowerCase())

  const { outBuffer, percent, outFile } = await compressSharp(img, buffer, filepath, writepath)
  if (outFile !== filepath || percent > -0.10)
    await fs.writeFile(outFile, outBuffer)
  if (outFile !== filepath)
    await fs.unlink(filepath)
}

files = (await glob('**/*.{jpg,png,jpeg}', {
  caseSensitiveMatch: false,
  absolute: true,
  cwd: folder,
}))
  .sort((a, b) => a.localeCompare(b))

const DEFAULT_LOCATION: [number, number] = [22.5431, 114.0579]

function extractGps(exif: Tags): [number, number] | null {
  const lat = exif.GPSLatitude?.value
  const latRef = exif.GPSLatitudeRef?.value?.[0]
  const lng = exif.GPSLongitude?.value
  const lngRef = exif.GPSLongitudeRef?.value?.[0]
  if (lat && lng && Array.isArray(lat) && Array.isArray(lng)) {
    const latDec = lat[0] + lat[1] / 60 + lat[2] / 3600
    const lngDec = lng[0] + lng[1] / 60 + lng[2] / 3600
    return [
      Math.round((latRef === 'S' ? -latDec : latDec) * 10000) / 10000,
      Math.round((lngRef === 'W' ? -lngDec : lngDec) * 10000) / 10000,
    ]
  }
  return null
}

function rotationForLocation(location: [number, number]): number {
  const key = location.join(',')
  let hash = 0
  for (const char of key)
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return Math.round(((hash / 0xFFFFFFFF) * 20 - 10) * 100) / 100
}

for (const filepath of files) {
  if (!basename(filepath).startsWith('p-'))
    continue

  const configFile = filepath.replace(/\.\w+$/, '.json')
  let config: PhotoMeta = {}
  if (existsSync(configFile))
    config = JSON.parse(await fs.readFile(configFile, 'utf-8')) as PhotoMeta

  const buffer = await fs.readFile(filepath)
  let changed = false

  if (!config.location) {
    try {
      const exif = await ExifReader.load(buffer)
      config.location = extractGps(exif) || DEFAULT_LOCATION
    }
    catch {
      config.location = DEFAULT_LOCATION
    }
    changed = true
  }

  const rotate = rotationForLocation(config.location!)
  if (config.rotate !== rotate) {
    config.rotate = rotate
    changed = true
  }

  if (!config.blurhash) {
    config.blurhash = await createBlurhash(buffer)
    changed = true
  }
  if (changed)
    await fs.writeFile(configFile, stringifyJson(config))
}

for (const json of await glob('**/*.json', {
  caseSensitiveMatch: false,
  absolute: true,
  cwd: folder,
})) {
  if (!existsSync(json.replace(/\.json$/, '.jpg')))
    await fs.unlink(json)
}

await ensureBlurhash(join(publicFolder, 'avatar_cropped.jpg'), join(dataFolder, 'avatar.json'), true)
