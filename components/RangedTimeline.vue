<template>
  <div class="row justify-center q-ma-md">
    <div class="col-8 col-md-10 col-md-8">
      <div v-for="(entry, index) in routineMap" :key="index"  >
        <q-badge>
          {{ entry.label }}
        </q-badge>
        <q-range
          :model-value="getValue(entry)"
          color="secondary"
          :min="min"
          :max="max"
          label
          thumb-size="10px"
          thumb-color="grey-9"
          :left-label-value="entry.started"
          :right-label-value="entry.ended"
          dense
          readonly
          markers
          :step="dynamicProduct"
          :marker-labels="index === routineMap.length - 1"
        >
          <template v-slot:marker-label-group="{ markerList }">
            <div
              v-if="index === routineMap.length - 1"
              v-for="marker in markerList"
              :key="marker.index"
              :class="[marker.value, marker.classes]"
              :style="Object.entries(marker.style).map(([key, value]) => `${key}: ${value};`)"
            >
              {{ formatTime(marker.value) }}
            </div>
          </template>
        </q-range>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps } from 'vue';

const props = defineProps<{
  routineMap: Array<{
    label: string;
    started: string;
    ended: string;
  }>
}>()

const getEarliestStartedValue = computed(() => {
  const earliestStartedValue = Math.min(...props.routineMap.map((entry) => Date.parse(entry.started)))-1000;
  return earliestStartedValue;
})

const getlatestEndedValue = computed(() => {
  const latestEndedValue = Math.max(...props.routineMap.map((entry) => Date.parse(entry.ended)))+1000;
  return latestEndedValue;
})

const fullRange = computed(() => getlatestEndedValue.value - getEarliestStartedValue.value);

const dynamicProduct = computed(() => {
  if (fullRange.value < 500) {
    return 50;
  }
  if (fullRange.value < 1000) {
    return 100;
  }
  if (fullRange.value < 5000) {
    return 500;
  }
  if (fullRange.value < 10000) {
    return 1000;
  }
  return 10000;
})

const min = computed(() => Math.floor(getEarliestStartedValue.value/dynamicProduct.value) * dynamicProduct.value);

const max = computed(() => Math.ceil(getlatestEndedValue.value/dynamicProduct.value) * dynamicProduct.value);

const model = ref<number | null>(null);

const getValue = (entry: { started: string; ended: string }) => {
  const min = Date.parse(entry.started);
  const max = Date.parse(entry.ended);
  return { min, max }
}

const formatTime = (value: number) => {
  const date = new Date(value);
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  };
  return `${date.toLocaleTimeString(undefined, options)}.${date.getMilliseconds()}`;
}
</script>
