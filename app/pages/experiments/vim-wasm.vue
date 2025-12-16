<script setup lang="ts">
import { checkBrowserCompatibility } from 'vim-wasm'

const compatibilityError = ref<string | undefined>()
const isHttps = ref(true)

useSeoMeta({
  title: 'Vim in Browser - Experiments - kvoon.me',
  description: 'Full Vim editor running in WebAssembly in your browser',
})

// Check browser compatibility and HTTPS
onMounted(() => {
  compatibilityError.value = checkBrowserCompatibility()
  isHttps.value = window.location.protocol === 'https:' || window.location.hostname === 'localhost'
})
</script>

<template>
  <div container mxa pt12>
    <div prose px4 dark:prose-invert>
      <h1>Vim in Browser</h1>
      <p>
        A full Vim editor running in WebAssembly. This is an experimental port of Vim to WebAssembly
        that runs entirely in your browser.
      </p>

      <div v-if="compatibilityError || !isHttps" class="browser-warning" bg-yellow-100 dark:bg-yellow-900 p-4 rounded mb-4>
        <p class="text-yellow-800 dark:text-yellow-200">
          <Icon name="ph:warning" class="inline mr-2" />
          <span v-if="!isHttps">
            Vim.wasm requires HTTPS to work properly. Please access this page via HTTPS.
            <br>
            <strong>Development tip:</strong> Use <code>pnpm dev --https</code> or access <code>https://localhost:3000</code>
          </span>
          <span v-else>
            {{ compatibilityError }}
          </span>
        </p>
      </div>

      <ClientOnly>
        <VimWasm />
      </ClientOnly>

      <div class="vim-info" mt-6>
        <h2>Features</h2>
        <ul>
          <li>Full Vim editor with syntax highlighting</li>
          <li>Vim script support</li>
          <li>Persistent configuration in <code>~/.vim</code></li>
          <li>System clipboard integration</li>
          <li>File drag & drop support</li>
          <li>JavaScript evaluation with <code>:!</code></li>
        </ul>

        <h2>Usage Tips</h2>
        <ul>
          <li>Click on the canvas to focus Vim</li>
          <li>Use <code>:export</code> to download current buffer</li>
          <li><code>:set clipboard=unnamed</code> to sync with system clipboard</li>
          <li>Drag & drop files to open them</li>
          <li>Configuration is stored in <code>~/.vim/vimrc</code></li>
        </ul>

        <h2>Browser Compatibility</h2>
        <p>
          Requires modern browsers with WebAssembly and SharedArrayBuffer support.
          Best experience in Chrome, Firefox, or Safari.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.browser-warning {
  border-left: 4px solid #f59e0b;
}
</style>
