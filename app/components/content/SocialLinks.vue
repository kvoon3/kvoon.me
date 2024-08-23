<script setup lang="ts">
const links = {
  'Github': {
    url: 'https://github.com/kvoon3',
    iconClass: 'i-carbon-logo-github',
  },
  'Twitter': {
    url: 'https://x.com/LiegaaiK',
    iconClass: 'i-carbon-logo-x',
  },
  'BiliBili': {
    url: 'https://space.bilibili.com/17061099?spm_id_from=..0.0',
    iconClass: 'i-custom-bilibili color-blue',
  },
  'NetEase Music': {
    url: 'https://y.music.163.com/m/user?id=98588392&dlt=0846&app_version=9.1.10',
    iconClass: 'i-custom-netease-music color-rose',
  },
}
</script>

<template>
  <div>
    <a v-for="{ url, iconClass }, label, key in links" :key :href="url" mb1 mr4 w-fit inline-flex items-center space-x-1>
      <i :class="iconClass" inline-block />
      <span>{{ label }}</span>
    </a>
  </div>
</template>
