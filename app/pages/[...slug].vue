<script setup lang="ts">
const route = useRoute()

const { data } = await useAsyncData(route.path, () => {
  return queryCollection('content').path(route.path).first()
})

function hasContentH1(body: unknown): boolean {
  if (!body || typeof body !== 'object')
    return false

  const { value } = body as { value?: unknown }
  return Array.isArray(value) && value.some(node => Array.isArray(node) && node[0] === 'h1')
}

function withTitleH1<T extends { body?: unknown, title?: string }>(page: T | null | undefined): T | null | undefined {
  if (!page?.title || hasContentH1(page.body))
    return page

  const body = page.body
  if (!body || typeof body !== 'object')
    return page

  const { value } = body as { value?: unknown }
  if (!Array.isArray(value))
    return page

  return {
    ...page,
    body: {
      ...body,
      value: [
        ['h1', {}, page.title],
        ...value,
      ],
    },
  }
}

const title = computed(() => route.path === '/' ? 'Kevin Kwong' : `${data.value?.title} - Kevin Kwong`)
const page = computed(() => withTitleH1(data.value))

useSeoMeta({
  title,
  description: data.value?.description,
})
</script>

<template>
  <div>
    <main mxa prose dark:prose-invert p8>
      <ContentRenderer v-if="page" w-fit :value="page" />
      <LicenseLink mt30 />
    </main>
  </div>
</template>
