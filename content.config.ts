import path from 'node:path'
import { defineCollection, defineContentConfig } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: {
        cwd: path.resolve('./content'),
        include: '**/*.md',
      },
    }),
  },
})
