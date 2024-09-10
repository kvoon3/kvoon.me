<script setup lang="ts">
import { iconMatch } from '~/shared/constants'

type Category = string

const props = defineProps<{
  projects: Record<Category, Record<string, string>[]>
}>()
</script>

<template>
  <div v-for="project, category, key in props.projects" :key="key">
    <h3>{{ category }}</h3>
    <section grid gap2 lg-sm:grid-cols-2>
      <a
        v-for="item, k in project" :key="k"
        :href="item.link" target="_blank"
        flex items-center border-none py4 btn-neutral hover:border-none
      >
        <figure m0 mr4 saturate-0>
          <i
            size-10
            :class="[
              item.icon
                || iconMatch.find(([re]) => re.test(item.link?.split('/').at(-1)!))?.[1]
                || 'i-carbon-unknown-filled',
            ]"
          />
        </figure>
        <aside>
          <header>
            <span>{{ item.name }}</span>
          </header>
          <span text-xs op70>{{ item.desc }}</span>
        </aside>
      </a>
    </section>
  </div>
</template>
