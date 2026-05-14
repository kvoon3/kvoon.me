<script setup lang="ts">
import { ToastProvider, ToastViewport } from 'reka-ui'
</script>

<template>
  <ToastProvider>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <CursorGlow />
    <ToastViewport class="fixed bottom-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[420px]" />
  </ToastProvider>
</template>
