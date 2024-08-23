<script setup lang="ts">
definePageMeta({
  layout: 'home',
})
</script>

<template>
  <NuxtLayout text-gray-700 font-sans dark:text-gray-200>
    <main dark="prose-invert" m-auto text-base prose prose-neutral>
      <ContentDoc>
        <template #default="{ doc }">
          <article>
            <PageToc fixed left-0 top-30 pl4 max-lg:hidden />
            <h1>{{ doc.title }}</h1>
            <p text-neutral-4>
              {{ doc.created }}
            </p>
            <ContentRenderer :value="doc" />
          </article>
        </template>
        <template #not-found>
          <h1>Document not found</h1>
        </template>
      </ContentDoc>
    </main>
  </NuxtLayout>
</template>
