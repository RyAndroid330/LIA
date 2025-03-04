<template>
  <NuxtLayout :name="layout">
    <template #title>
      {{ selectedItem?.name }} - {{ selectedItem?.uuid.slice(0, 8) }}
    </template>
    <div class="row q-mx-md">
      <InfoCard v-if="selectedItem">
        <template #title>
          {{ selectedItem?.name }}
        </template>
        <template #info>
          <div class="flex-column full-width">
            <div class="q-mx-md q-my-sm">
              Description: {{ selectedItem?.description }}
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
      <InfoCard>
        <template #title>
          Tasks Function
        </template>
        <template #info>
          <pre>{{ selectedItem?.function_string }}</pre>
        </template>
      </InfoCard>
      <TaskRoutinePieChart :type="'task'" :taskId="String(route.params.id)"></TaskRoutinePieChart>
      <ExecutionTimeChart :type="'task'" :taskId="String(route.params.id)"></ExecutionTimeChart>
      <Table
        class="custom-table"
        :columns="columns"
        :rows="tasks"
        row-key="uuid"
        @inspect-row="inspectTask"
      >
        <template #title>
          Active Executions
        </template>
      </Table>
      <TaskHeatMap :taskId="String(route.params.id)"/>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useFetch, useRoute, useRouter } from '#app';
import InfoCard from '~/components/InfoCard.vue';
import TaskHeatMap from '~/components/TaskHeatMap.vue';
import TaskRoutinePieChart from '~/components/TaskRoutinePieChart.vue';
import ExecutionTimeChart from '~/components/executionTimeChart.vue';

// Define the Item interface
interface Item {
  taskId: string;
  type: string;
  name: string;
  description: string;
  function_string: string;
  id: any;
  executionId: any;
  progress: any;
  uuid: any;
  processing_graph: string;
  created: string;
  deleted: boolean;
}

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
const { data: Items, error } = await useFetch(`/api/task/${route.params.id}`);

// Error handling
if (error.value) {
  console.error('Error fetching Items:', error.value);
}

// Fetch the execution times data
const { data: executionData, error: executionError } = await useFetch(`/api/taskExecutionTimes?taskId=${route.params.id}`);

// Error handling for execution times
if (executionError.value) {
  console.error('Error fetching execution times:', executionError.value);
} else if (executionData.value && !('error' in executionData.value)) {
  executionTimes.value = executionData.value;
}

interface Task {
  type: string;
  label: string;
  description: string;
  id: any;
  executionId: any;
  progress: any;
  uuid: string;
}

const selectedTask = ref<Task[] | undefined>(undefined);
watch(selectedTask, newValue => {
  console.log(newValue);
});

const columns = [
  {
    name: 'name',
    label: 'Name',
    field: 'name',
    required: true,
    sortable: true,
  },
  {
    name: 'taskDescription',
    label: 'Description',
    field: 'taskDescription',
    required: true,
    sortable: false,
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

const tasks = ref([]);

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

function inspectTask(task: Task) {
  navigateToItem(`/activity/tasks/${task.uuid}`);
}

const navigateToItem = (route: string) => {
  console.log('Navigating to route:', route);
  router.push(route);
}

// Set the selected item based on the route parameter
onMounted(() => {
  const appStore = useAppStore();
  appStore.setCurrentSection('assets');

  const itemId: string = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  selectedItem.value = Items.value?.find((item: Item) => item.uuid === itemId);

  console.log('Selected Item:', selectedItem.value);

  fetchActiveTasks(itemId);
});

async function fetchActiveTasks(itemId: string) {
  console.log('Fetching active tasks for itemId:', itemId);
  const response = await fetch(`/api/activeTasks${itemId ? `?id=${itemId}` : ''}`, { method: 'GET' });
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

  console.log('Fetched active tasks data:', data);
  tasks.value = data.map((r: any) => {
    return {
      uuid: r.id,
      name: r.name,
      taskDescription: r.taskDescription,
      status: r.status,
      progress: r.progress,
      started: formatDate(r.started),
      ended: formatDate(r.ended),
      duration: getDuration(r.started, r.ended),
    };
  });
  console.log('Mapped tasks:', tasks.value);
}

</script>

<style scoped>
.custom-table {
  background-color: #e6b30dc4;
}
</style>
