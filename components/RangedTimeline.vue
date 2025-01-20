<template>
  <div class="row justify-center q-ma-lg">
    <div class="col-12 col-md-10 col-lg-8">
      <div v-for="(entry, index) in routineMap" :key="index">
        <q-badge>
          {{ entry.label }}
        </q-badge>
        <q-range
          class="q-ma-lg"
          :model-value="getValue(entry)"
          color="secondary"
          inner-track-color="primary"
          :min="getEarliestScheduledValue"
          :max="getlatestEndedValue"
          :inner-min="Date.parse(entry.scheduled)-200"
          :inner-max="Date.parse(entry.ended)"
          label-always
          :left-label-value="entry.started"
          :right-label-value="entry.ended"
          dense

        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QTimelineEntry } from 'quasar';
import { ref, computed, defineProps } from 'vue';
import RoutineMap from './routineMap.vue';

const props = defineProps<{
  routineMap: Array<{
    label: string;
    scheduled: string;
    started: string;
    ended: string;
  }>
}>()

const getEarliestScheduledValue = computed(() => {
  const earliestScheduledValue = Math.min(...props.routineMap.map((entry) => Date.parse(entry.scheduled)))-1000;
  console.log(`Earliest scheduled value: ${earliestScheduledValue}`);
  return earliestScheduledValue;
})

const getlatestEndedValue = computed(() => {
  const latestEndedValue = Math.max(...props.routineMap.map((entry) => Date.parse(entry.ended)))+1000;
  console.log(`Latest ended value: ${latestEndedValue}`);
  return latestEndedValue;
})

const getValue = (entry: { started: string; ended: string }) => {
  const min = Date.parse(entry.started);
  const max = Date.parse(entry.ended);
  return { min, max }
}
</script>
