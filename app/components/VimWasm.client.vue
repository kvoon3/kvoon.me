<script setup lang="ts">
import { VimWasm } from 'vim-wasm'

const canvas = ref<HTMLCanvasElement>()
const input = ref<HTMLInputElement>()

const loading = ref(true)
const error = ref<string | null>(null)
const vimStarted = ref(false)
const isFullscreen = ref(false)

// Initialize Vim
async function initVim() {
  if (!canvas.value || !input.value)
    return

  loading.value = true
  error.value = null

  try {
    const vim = new VimWasm({
      canvas: canvas.value,
      input: input.value,
      workerScriptPath: '/node_modules/vim-wasm/vim.js',
    })

    // Setup callbacks
    vim.onVimInit = () => {
      vimStarted.value = true
      loading.value = false
    }

    vim.onVimExit = () => {
      vimStarted.value = false
    }

    // Start Vim with some initial configuration
    vim.start({
      debug: false,
      cmdArgs: ['~/.vim/vimrc'],
      dirs: ['/.vim'],
      files: {
        '/.vim/vimrc': `
" Basic Vim configuration for browser
set number
set relativenumber
set expandtab
set tabstop=2
set shiftwidth=2
set autoindent
set clipboard=unnamed
syntax on

" Colorscheme
colorscheme onedark

" Key mappings for better browser experience
nnoremap <C-s> :export<CR>
`,
      },
    })

    // Handle drag and drop
    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      if (e.dataTransfer?.files.length) {
        const file = e.dataTransfer.files[0]

        if (!file)
          return

        const reader = new FileReader()
        reader.onload = () => {
          vim.cmdline(`e ${file.name}`)
          // Note: Actually writing the file content would require more complex integration
        }
        reader.readAsText(file)
      }
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
    }

    canvas.value.addEventListener('drop', handleDrop)
    canvas.value.addEventListener('dragover', handleDragOver)

    // Cleanup
    onUnmounted(() => {
      canvas.value?.removeEventListener('drop', handleDrop)
      canvas.value?.removeEventListener('dragover', handleDragOver)
    })
  }
  catch (err) {
    console.error('Failed to initialize Vim:', err)
    error.value = `Failed to initialize Vim: ${err instanceof Error ? err.message : 'Unknown error'}`
    loading.value = false
  }
}

// Focus input when canvas is clicked
function focusInput() {
  input.value?.focus()
}

// Handle key events
function handleKeydown(e: KeyboardEvent) {
  // Prevent browser shortcuts that might interfere
  if (e.ctrlKey && (e.key === 's' || e.key === 'o' || e.key === 'n')) {
    e.preventDefault()
  }
}

function handleKeyup() {
  // Additional key handling if needed
}

// Reset Vim
function resetVim() {
  // This would require restarting the Web Worker
  // For now, we'll just reload the page
  window.location.reload()
}

// Toggle fullscreen
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    canvas.value?.parentElement?.requestFullscreen()
    isFullscreen.value = true
  }
  else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// Handle fullscreen change
onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })

  // Initialize Vim after component is mounted
  initVim()
})
</script>

<template>
  <div class="vim-container" border rounded overflow-hidden>
    <div class="vim-toolbar" bg-gray-100 dark:bg-gray-800 p-2 border-b flex items-center justify-between>
      <div class="vim-title" flex items-center gap-2>
        <Icon name="ph:terminal" size-5 />
        <span font-medium>Vim in Browser</span>
      </div>
      <div class="vim-controls" flex items-center gap-2>
        <button
          class="control-btn"
          p-2
          rounded hover:bg-gray-200 dark:hover:bg-gray-700 title="Reset Vim"
          @click="resetVim"
        >
          <Icon name="ph:arrow-clockwise" size-4 />
        </button>
        <button
          class="control-btn"
          p-2
          rounded hover:bg-gray-200 dark:hover:bg-gray-700 :title="isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'"
          @click="toggleFullscreen"
        >
          <Icon :name="isFullscreen ? 'ph:arrows-in-simple' : 'ph:arrows-out-simple'" size-4 />
        </button>
      </div>
    </div>

    <div class="vim-content" relative>
      <div v-if="loading" class="loading-overlay" absolute inset-0 bg-white dark:bg-dark flex items-center justify-center>
        <div text-center>
          <Icon name="ph:spinner-gap" size-8 class="animate-spin" mb-2 />
          <p>Loading Vim...</p>
        </div>
      </div>

      <div v-if="error" class="error-overlay" absolute inset-0 bg-red-50 dark:bg-red-900 flex items-center justify-center>
        <div text-center>
          <Icon name="ph:warning-circle" size-8 text-red-500 mb-2 />
          <p text-red-700 dark:text-red-300>
            {{ error }}
          </p>
          <button mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 @click="initVim">
            Retry
          </button>
        </div>
      </div>

      <canvas
        ref="canvas"
        class="vim-canvas"
        w-full
        :class="{ 'cursor-none': vimStarted }"
        @click="focusInput"
      />
      <input
        ref="input"
        class="vim-input"
        absolute opacity-0 pointer-events-none
        autocomplete="off"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
      >
    </div>
  </div>
</template>

<style scoped>
.vim-canvas {
  display: block;
  background: #1e1e1e;
  min-height: 400px;
}

.vim-canvas.cursor-none {
  cursor: none;
}

.loading-overlay, .error-overlay {
  z-index: 10;
}

.control-btn {
  transition: background-color 0.2s ease;
}
</style>
