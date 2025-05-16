<template>
  <NuxtLayout name="dashboard-layout">
    <NuxtLayout name="dashboard-main-layout">
    <template #title>
      Task executions
    </template>
    <div class="row q-mx-md">
      <Table
          :columns="columns"
          :rows="tasks"
          :last-page="lastPage"
          row-key="uuid"
          @inspect-row="inspectTask"
          @inspect-row-in-new-tab="inspectInNewTab"
          @load-more-data="loadMoreTasks"
      />
      <FrequencyPieChart v-if="tasks.length > 0" :values="tasks" />
    </div>
  </NuxtLayout>
</NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch } from '#app';
import { useRouter } from '#vue-router';

interface task {
  type: string;
  label: string;
  description: string;
  id: any;
  executionId: any;
  progress: any;
  uuid: string;
}

const layout = 'dashboard-layout';
const selectedTask = ref<task[] | undefined>(undefined);
watch( selectedTask, newValue => {
} );

const columns = [
  {
    name: 'name',
    label: 'Name',
    field: 'name',
    required: true,
    sortable: true,
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
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
  {
    name: 'ended',
    label: 'Ended',
    field: 'ended',
    required: true,
    sortable: true,
  },
  {
    name: 'duration',
    label: 'Duration (sec)',
    field: 'duration',
    required: true,
    sortable: true,
  },
  // {
  //   name: 'server',
  //   label: 'Server',
  //   field: 'server',
  //   required: true,
  //   sortable: true,
  // }
];

const tasks = ref<task[]>([]); // Explicitly type tasks as task[]

const currentPage = ref(1);
const pageSize = 50;
const lastPage = ref<number>(1); // Ensure lastPage is properly initialized as a number

const router = useRouter();

function formatDate( date: string ) {
  const datetime = new Date( date );
  return `${ datetime.toDateString() } ${ datetime.toLocaleTimeString() }`;
}

function getDuration( start: number, end?: number ) {
  const startTime = new Date( start );
  let endTime;
  if ( !end ) {
    endTime = new Date( Date.now() );
  } else {
    endTime = new Date( end );
  }
  const duration = +endTime - +startTime;
  return duration / 1000;
}

function inspectTask( task:task ) {
  navigateToItem( `/activity/tasks/${ task.uuid }` );
}
function inspectInNewTab( task:task ) {
  const url = `/activity/tasks/${ task.uuid }`;
  window.open(url, '_blank');
}

const navigateToItem = ( route: string ) => {
  router.push(route);
};

async function loadMoreTasks() {
  try {
    currentPage.value++;
    const response = await fetch(`/api/activeTasks?page=${currentPage.value}&limit=${pageSize}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();

    tasks.value = [...tasks.value, ...data.tasks.map((r: any) => {
      return {
        uuid: r.id,
        name: r.name,
        description: r.description,
        status: r.isComplete ? 'check' : r.isRunning ? 'play_arrow' : r.errored ? 'close' : 'schedule',
        progress: r.progress,
        started: formatDate(r.started),
        ended: formatDate(r.ended),
        duration: getDuration(r.started, r.ended),
        server: r.serverName,
        serverId: r.serverId,
        processingGraph: r.processingGraph,
        isRunning: r.isRunning,
        referer: r.errored ? 'Errored' : null,
      };
    })];

    lastPage.value = data.lastPage; // Update lastPage dynamically from the API response
  } catch (error) {
    console.error('Error loading more tasks:', error);
  }
}

onMounted(async () => {
  const appStore = useAppStore();
  appStore.setCurrentSection('serverActivity');

  try {
    const response = await fetch(`/api/activeTasks`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();

    tasks.value = data.tasks.map((r: any) => {
      return {
        uuid: r.id,
        name: r.name,
        description: r.description,
        status: r.isComplete ? 'check' : r.isRunning ? 'play_arrow' : r.errored ? 'close' : 'schedule',
        progress: r.progress,
        started: formatDate(r.started),
        ended: formatDate(r.ended),
        duration: getDuration(r.started, r.ended),
        server: r.serverName,
        serverId: r.serverId,
        processingGraph: r.processingGraph,
        isRunning: r.isRunning,
        referer: r.errored ? 'Errored' : null,
      };
    });

    lastPage.value = data.lastPage; // Set initial lastPage value
  } catch (error) {
    console.error('Error fetching tasks on mount:', error);
  }
});
</script>
