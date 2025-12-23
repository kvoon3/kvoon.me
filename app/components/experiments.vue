<script setup lang="ts">
interface Experiment {
  name: string
  description: string
  link: string
  icon: string
  tags: string[]
}

withDefaults(defineProps<{
  experiments?: Experiment[]
}>(), {
  experiments: () => [],
})
</script>

<template>
  <!-- !NOTE: 'not-prose' is only available in class -->
  <div class="not-prose">
    <div grid="~ cols-1 gap-6" mt-8>
      <NuxtLink
        v-for="experiment in experiments"
        :key="experiment.name"
        :to="experiment.link"
        :title="experiment.name"
        p-6
        border-base
        bg-white:10
        dark:bg-dark:10
      >
        <div flex="~ col gap-4">
          <div flex="~ items-center gap-3">
            <Icon :name="experiment.icon" size-6 text-primary />
            <h3 font-medium>
              {{ experiment.name }}
            </h3>
          </div>
          <p text-sm text-gray-600 dark:text-gray-400>
            {{ experiment.description }}
          </p>
          <div flex="~ gap-2 wrap">
            <span
              v-for="tag in experiment.tags"
              :key="tag"
              px-2
              py-1
              text-xs
              bg-primary:10
              text-primary
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div v-if="experiments.length === 0" text-center py-20>
      <Icon name="ph:flask" size-20 op-50 mb-4 mxa />
      <h3 text-xl mb-2>
        No experiments yet
      </h3>
      <p op-75>
        Preparing some interesting frontend experiments...
      </p>
    </div>
  </div>
</template>
