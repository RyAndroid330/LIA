<template>
  <NuxtLayout :name="layout">
    <template #title>
      Task executions
    </template>
    <div class="row q-mx-md">
      <Table
          :columns="columns"
          :rows="tasks"
          row-key="uuid"
          @inspect-row="inspectTask"
      />
    </div>
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
}

const layout = 'dashboard-layout';
const selectedTask = ref<task[] | undefined>(undefined);
watch( selectedTask, newValue => {
  console.log( newValue );
} );

const columns = [
  {
    name: 'label',
    label: 'Name',
    field: 'label',
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
];

const tasks = ref( [] );

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

function inspectTask( task ) {
  navigateToItem( `/activity/tasks/${ task.uuid }` );
}

const navigateToItem = ( route: string ) => {
  console.log('Navigating to route:', route);
  router.push(route);
};

// Fetch server stats and set the current section on component mount
onMounted(async () => {
  const appStore = useAppStore();
  appStore.setCurrentSection('serverActivity');
  const response = await fetch('/api/activeTasks');
  if (!response.ok) throw new Error('Network response was not ok');
  const data = await response.json();
  tasks.value = data.map( r => {
    return {
      uuid: r.uuid,
      label: r.label,
      taskDescription: r.taskDescription,
      status: r.status,
      progress: r.progress,
      started: formatDate( r.started ),
      ended: formatDate( r.ended ),
      duration: getDuration( r.started, r.ended ),
    };
  } );
});
</script>



<!-- <template>
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
const { data: tasks, error } = await useFetch<task[]>('/api/activeTasks');

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
</script> --> -->
