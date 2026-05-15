import { spawn } from 'node:child_process'
import process from 'node:process'
import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'nowd',
    configKey: 'nowd',
  },
  defaults: {
    command: 'dev',
  },
  setup(options, nuxt) {
    if (!nuxt.options.dev) {
      return
    }

    let child: ReturnType<typeof spawn> | null = null

    nuxt.hook('ready', () => {
      child = spawn('pnpm', ['--filter', 'nowd', options.command], {
        cwd: nuxt.options.rootDir,
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_ENV: 'development',
        },
      })

      child.on('exit', (code) => {
        if (code !== null && code > 0) {
          console.error(`[nowd] exited with code ${code}`)
        }
      })
    })

    nuxt.hook('close', () => {
      if (child) {
        child.kill('SIGTERM')
        child = null
      }
    })
  },
})
