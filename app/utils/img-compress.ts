/* eslint-disable node/prefer-global/buffer */

import type { Sharp } from 'sharp'

const maxSize = 1440

export async function compressSharp(image: Sharp, inBuffer: Buffer, inFile: string, outFile: string) {
  const { format, width, height } = await image.metadata()
  if (!format)
    throw new Error(`Could not determine format of ${inFile}`)
  if (!width || !height)
    throw new Error(`Could not determine size of ${inFile}`)
  if (format !== 'jpeg' && format !== 'png' && format !== 'webp')
    throw new Error(`Unsupported format ${format} of ${inFile}`)

  // Bake EXIF orientation into pixel data so we can safely strip all metadata below
  image = image.rotate()

  if (width > maxSize || height > maxSize)
    image = image.resize(maxSize)

  image = image[format]({
    quality: format === 'png' ? 100 : 80,
    compressionLevel: 9,
  })

  const outBuffer = await image.toBuffer()
  const size = inBuffer.byteLength
  const outSize = outBuffer.byteLength

  const percent = (outSize - size) / size
  return {
    image,
    outBuffer,
    size,
    outSize,
    percent,
    inFile,
    outFile,
  }
}
