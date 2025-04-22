<template>
  <NuxtLayout name="dashboard-layout">
    <NuxtLayout name="dashboard-main-layout">
    <template #title>
      {{ selectedItem?.name }} - {{ selectedItem?.uuid.slice(0, 8) }}
    </template>
    <div class="row q-mx-md">
      <RoutineMap :routineMap="routineMap" />
      <InfoCard v-if="selectedItem">
        <template #title>
          {{ selectedItem?.name }}
        </template>
        <template #info>
          <div class="flex-column full-width">
            <div class="q-mx-md q-my-sm">
              Description: {{ selectedItem?.description }}
            </div>
            <div class="q-mx-md q-my-sm">
              Function: {{ selectedItem?.function_string }}
            </div>
            <div class="q-separator" style="height: 2px"></div>
            <div class="q-mx-md q-my-sm">
              UUID: {{ selectedItem?.uuid }}
            </div>
            <div class="q-mx-md q-my-sm">
              Type: {{ selectedItem?.type }}
            </div>
            <div class="q-mx-md q-my-sm" @click="navigateToItem( `/assets/${ selectedItem?.processing_graph }` )">
              Processing Graph: <span class="text-primary cursor-pointer">{{ selectedItem?.processing_graph }}</span>
            </div>
            <div class="q-mx-md q-my-sm">
              Created: {{ new Date(selectedItem?.created).toLocaleString() }}
            </div>
            <div class="q-mx-md q-my-sm">
              Deleted: {{ selectedItem?.deleted ? 'Yes' : 'No' }}
            </div>
          </div>
        </template>
      </InfoCard>
      <TaskRoutinePieChart type="routine" :routineId="String(route.params.id)" />
      <ExecutionTimeChart v-if="selectedItem" :type="'routine'" :routineId="String(route.params.id)"></ExecutionTimeChart>
      <Table
        class="custom-table"
        :columns="columns"
        :rows="routines"
        row-key="uuid"
        @inspect-row="inspectRoutine"
        @inspect-row-in-new-tab="inspectInNewTab"
      >
        <template #title>
          Active Executions
        </template>
      </Table>
      <RoutineHeatMap :routineId="String(route.params.id)" />
    </div>
  </NuxtLayout>
</NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useFetch, useRoute, useRouter } from '#app';
import InfoCard from '~/components/InfoCard.vue';

// Define the Item interface
interface Item {
  type: string;
  name: string;
  description: string;
  function_string: string;
  id: any;
  executionId: any;
  progress: any;
  uuid: any;
  routine_id: any;
  processing_graph: string;
  created: string;
  deleted: boolean;
}

// Define the ExecutionTime interface
interface ExecutionTime {
  date: string;
  hour: number;
  executions: number;
  total_execution_time: number;
  slowest_time: number;
  fastest_time: number;
  average_time: number;
}

const layout = 'dashboard-layout';
const selectedItem = ref<Item | null>(null);
const executionTimes = ref<ExecutionTime[]>([]);
const route = useRoute();

// Fetch the Items data
const { data: Items, error } = await useFetch(`/api/routine/${route.params.id}`);

// Error handling
if (error.value) {
  console.error('Error fetching Items:', error.value);
}

// Fetch the execution times data
const { data: executionData, error: executionError } = await useFetch(`/api/routineExecutionTimes?routineId=${route.params.id}`);

// Error handling for execution times
if (executionError.value) {
  console.error('Error fetching execution times:', executionError.value);
} else if (executionData.value && !('error' in executionData.value)) {
  executionTimes.value = executionData.value;
}

interface Routine {
  type: string;
  label: string;
  description: string;
  id: any;
  executionId: any;
  progress: any;
  uuid: string;
}

const selectedRoutine = ref<Routine[] | undefined>(undefined);


const columns = [
  {
    name: 'label',
    label: 'Name',
    field: 'label',
    required: true,
    sortable: true,
  },
  {
    name: 'progress',
    label: 'Progress',
    field: 'progress',
    required: true,
    sortable: false,
  },
  {
    name: 'started',
    label: 'Started',
    field: 'started',
    required: true,
    sortable: true,
  },
];

const routines = ref([]);

const router = useRouter();

function formatDate(date: string) {
  const datetime = new Date(date);
  return `${datetime.toDateString()} ${datetime.toLocaleTimeString()}`;
}

function getDuration(start: number, end?: number) {
  const startTime = new Date(start);
  let endTime;
  if (!end) {
    endTime = new Date(Date.now());
  } else {
    endTime = new Date(end);
  }
  const duration = +endTime - +startTime;
  return duration / 1000;
}

function inspectRoutine(routine: Routine) {
  navigateToItem(`/activity/routines/${routine.uuid}`);
}

function inspectInNewTab(routine: Routine) {
  window.open(`/activity/routines/${routine.uuid}`, '_blank');
}

const navigateToItem = (route: string) => {
  router.push(route);
}

const routineMap = computedAsync(async () => {
  if (selectedItem.value) {
    const tasks = await $fetch(`/api/staticTasksInRoutine?routineId=${selectedItem.value.uuid}`);
    return tasks?.map((task: any) => {
      return {
        uuid: task.uuid,
        label: task.name,
        layer_index: task.layer_index,
        previousTaskExecutionId: task.previous_task_execution_id,
      };
    }) || [];
  }
  return [];
}, []);

// Set the selected item based on the route parameter
onMounted(async () => {
  const appStore = useAppStore();
  appStore.setCurrentSection('assets');

  const itemId: string = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  selectedItem.value = Items.value?.find((item: Item) => item.uuid === itemId);
  fetchActiveRoutines(itemId);
});
async function fetchActiveRoutines(itemId: string) {
  const response = await fetch(`/api/activeRoutines${itemId ? `?id=${itemId}` : ''}`, { method: 'GET' });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const responseText = await response.text();
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    throw new Error('Failed to parse JSON response');
  }

  routines.value = data.map((r: any) => {
    return {
      uuid: r.id,
      label: r.label,
      routineDescription: r.routineDescription,
      status: r.status,
      progress: r.progress,
      started: formatDate(r.started),
      ended: formatDate(r.ended),
      duration: getDuration(r.started, r.ended),
    };
  });
}

</script>

<style scoped>
.custom-table {
  background-color: #e6b30dc4;
}
</style>
