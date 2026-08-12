<script setup lang="ts">
import {
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuRoot,
} from 'reka-ui'
import { useRoute } from '#imports'

const route = useRoute()

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/photos', label: 'Photos' },
]

function isActive(path: string) {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <nav p4 bg-neutral:10 flex="~ items-center gap2">
    <ActivityAppButton />

    <NuxtLink to="/" class="sm:block hidden">
      kvoon.me
    </NuxtLink>

    <div flex-auto />

    <NavigationMenuRoot class="relative">
      <NavigationMenuList
        class="flex items-center gap2 overflow-x-auto scrollbar-hide max-w-60 sm:max-w-80 md:max-w-100 flex-shrink-1 min-w-0 whitespace-nowrap"
      >
        <NavigationMenuItem v-for="item in navItems" :key="item.path">
          <NavigationMenuLink as-child>
            <NuxtLink
              :to="item.path"
              class="btn" :class="[
                isActive(item.path) ? 'bg-active' : '',
              ]"
            >
              {{ item.label }}
            </NuxtLink>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuIndicator
          class="absolute bottom-0 left-0 h-0.5 bg-neutral-400 dark:bg-neutral-600 transition-all duration-200"
        />
      </NavigationMenuList>
    </NavigationMenuRoot>

    <ToggleDark />
  </nav>
</template>
