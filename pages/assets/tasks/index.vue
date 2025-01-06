<template>
  <NuxtLayout :name="layout">
    <template #title>
      tasks
    </template>
    <div class="row justify-around q-ma-lg">
      <List
        v-if="tasks"
        :listLabel="'tasks'"
        :items="tasks"
        @item-selected="onSelect"
      />
      <InfoCard v-if="selectedtask">
        <template #title>
          {{ selectedtask?.label }}
        </template>
        <template #info>
          {{ selectedtask?.description }}
        </template>
      </InfoCard>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch } from '#app';

// Define the tasks interface
interface tasks {
  type: string;
  label: string;
  description: string;
  id: any;
  executionId: any;
  progress: any;
  uuid: any;
}

const layout = 'dashboard-layout';
const selectedtask = ref<tasks | null>(null);

// Fetch the tasks data
const { data: tasks, error } = await useFetch('/api/tasks');

// Error handling
if (error.value) {
  console.error('Error fetching tasks:', error.value);
}

// Function to handle item selection
function onSelect(item: tasks) {
  console.log('Selected task:', item.label); // Log the selected task
  selectedtask.value = item;
}

// Set the current section on mount
onMounted(() => {
  const appStore = useAppStore();
  appStore.setCurrentSection('assets');
});

console.log('tasks:', tasks.value);
</script>
