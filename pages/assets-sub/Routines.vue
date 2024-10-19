<template>
  <NuxtLayout :name="layout">
    <template #title>
      Routines
    </template>
    <div class="row justify-around q-ma-lg">
      <List
        v-if="routines"
        :listLabel="'Routines'"
        :items="routines"
        @item-selected="onSelect"
      />
      <InfoCard v-if="selectedroutine" :item="selectedroutine">
        <template #title>
          {{ selectedroutine?.label }}
        </template>
        <template #info>
          {{ selectedroutine?.description }}
        </template>
      </InfoCard>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch } from '#app';

// Define the Routine interface
interface Routine {
  type: string;
  label: string;
  description: string;
  id: any;
  executionId: any;
  progress: any;
  uuid: any;
}

const layout = 'dashboard-layout';
const selectedroutine = ref<Routine | null>(null);

// Fetch the routines data
const { data: routines, error } = await useFetch('/api/routines');

// Error handling
if (error.value) {
  console.error('Error fetching routines:', error.value);
}

// Function to handle item selection
function onSelect(item: Routine) {
  console.log(item.label);
  selectedroutine.value = item;
}

// Set the current section on mount
onMounted(() => {
  const appStore = useAppStore();
  appStore.setCurrentSection('assets');
});
</script>
