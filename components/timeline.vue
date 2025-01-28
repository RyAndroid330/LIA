<template>
  <q-timeline class="q-ma-xl" layout='loose' style = "max-width:75%">
    <q-timeline-entry
      v-for="(entry, index) in routineMap"
      :key="index"
      :title="entry.label"
      :subtitle="formatDate(entry.started)"
      :body="getBody(entry)"

    />
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

function getBody(entry) {
  console.log(entry)
  return `${entry.description}\n  ${JSON.stringify(entry.inputContext)}}`
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
