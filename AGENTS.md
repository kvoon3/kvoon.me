# Agent Guidelines for kvoon.me

## General Guidelines

When reviewing or modifying code, identify and remove AI-generated patterns that humans wouldn't write:

- **Redundant Comments**: Remove obvious comments like `// Check if user exists` before `if (user)` or `// Return the result`
- **Defensive Checks**: Remove unnecessary null checks, try-catch blocks, or validations that framework/types already handle
- **Type Bypasses**: Replace `any` types used to bypass TypeScript with proper types or type assertions
- **Style Inconsistencies**: Ensure code matches existing file patterns (spacing, naming, structure)
- **Verbose Logic**: Simplify unnecessarily complex conditionals or ternaries
- **Boilerplate**: Remove duplicate error handling, repeated validation patterns, or unnecessary abstractions

## Build/Lint/Test Commands
- **Dev**: `pnpm dev` (start Nuxt dev server)
- **Build**: `pnpm build` (production build)
- **Lint**: `pnpm lint` (ESLint) or `pnpm lint:fix` (auto-fix)
- **Type Check**: `pnpm typecheck` (Vue type checking with vue-tsc)
- **Preview**: `pnpm preview` (preview production build)

## Tech Stack
- **Framework**: Nuxt 4 (Vue 3 + TypeScript)
- **Styling**: UnoCSS (Tailwind-like utilities, shortcuts defined in unocss.config.ts)
- **State**: Pinia for global state, composables for logic
- **Backend**: Nitro server with Redis (Upstash), Pusher for real-time
- **Linting**: @antfu/eslint-config (auto-import aware, no formatters)

## Code Style
- **Imports**: Use `#app`, `#shared` aliases; auto-imports enabled (Vue/Nuxt APIs)
- **Types**: Explicit return types for exported functions; use `type` imports where possible
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Vue**: Composition API with `<script setup lang="ts">`, props/emits/model via defineProps/defineEmits/defineModel
- **Error Handling**: Use `createError()` for server errors; try-catch for async ops; console.error for logging
- **Functions**: JSDoc comments for exported utility functions; descriptive names over comments

### Vue

`defineProps/defineEmits` usage:

```ts
const props = defineProps<{
  foo: string
  bar?: number
}>()

const emit = defineEmits<{
  change: [id: number]
  update: [value: string]
}>()
```

`defineModel` usage:

```html
<UserName
  v-model:first-name="first"
  v-model:last-name="last"
/>

<script setup>
const firstName = defineModel('firstName')
const lastName = defineModel('lastName')
</script>

<template>
  <input type="text" v-model="firstName" />
  <input type="text" v-model="lastName" />
</template>
```
