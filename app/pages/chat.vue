<script setup lang="ts">
const { isAuthenticated } = useAuth()
</script>

<template>
  <div>
    <AuthForm v-if="!isAuthenticated" mxa mt4 />
    <ChatRoom v-else mxa mt4 h-70vh w-80vw rounded border />
  </div>
</template>
