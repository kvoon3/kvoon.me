import { addImports, defineNuxtModule } from 'nuxt/kit'

export default defineNuxtModule({
  setup() {
    addImports({ name: 'consola', from: 'consola' })
  },
})
