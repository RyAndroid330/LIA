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
      <InfoCard v-if="selectedtask" :item="selectedtask">
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

interface task {
  type: string;
  label: string;
  description: string;
  id: any;
  executionId: any;
  progress: any;
}

const layout = 'dashboard-layout';
const selectedtask = ref<task | null>(null);

// Fetch the tasks data
const { data: tasks, error } = await useFetch<task[]>('/api/taskExecutions');

// Error handling
if (error.value) {
  console.error('Error fetching tasks:', error.value);
}

// Function to handle item selection
function onSelect(item: task) {
  console.log(item.type, item.executionId);
  selectedtask.value = item;
}

// Fetch server stats and set the current section on component mount
onMounted(() => {
  const appStore = useAppStore();
  appStore.setCurrentSection('serverActivity');
});
</script>



<!-- <template>
  <NuxtLayout :name='layout'>
    <template #title>
      Tasks
    </template>
    <div class="row justify-around q-ma-lg">
      <List :listLabel="'Active Tasks'" :items="tasks" />
      <InfoCard>
        <template #title>
          Task
        </template>
        <template #info>
          Task description
        </template>
      </InfoCard>
    </div>
  </NuxtLayout>
</template>


<script setup lang='ts'>
import { useListStore } from '~/stores/listStore';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const layout = 'dashboard-layout';
const listStore = useListStore();
const { getItems } = storeToRefs(listStore);

const tasks = computed(() => getItems.value.filter(item => item.type === 'task'));

onMounted(() => {
  const appStore = useAppStore();
  appStore.setCurrentSection('serverActivity');
});
</script> -->
