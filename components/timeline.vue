<template>
  <q-timeline class="q-ma-xl" layout='loose' style = "max-width:75%">
    <q-timeline-entry
      v-for="(entry, index) in routineMap"
      :key="index"
      :title="entry.label"
      :subtitle="formatDate(entry.started)"
      >
      <q-badge v-if="entry.description" color="primary">
        {{ getDescription(entry)}}
      </q-badge>
       <blockquote>
        <pre > {{ getContext(entry)}}</pre>
       </blockquote>
      </q-timeline-entry>
  </q-timeline>
</template>

<script setup>
import { computed } from 'vue'

defineProps({
  routineMap: {
    type:Object,
    required: true
  }
})

function getDescription(entry) {
  return entry.description
}
function getContext(entry) {
  return JSON.stringify(entry.inputContext,null,2)
}

const formatDate = computed(() => (date) => {
  const formattedDate = new Date(date)
  return `${formattedDate.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })}`
})
</script>
