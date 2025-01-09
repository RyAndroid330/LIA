<template>
  <NuxtLayout :name="layout">
    <template #title>
      Tasks
    </template>
    <div class="row q-mx-md">
      <Table
          :columns="columns"
          :rows="tasks"
          row-key="uuid"
          @inspect-row="inspectTasks"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch } from '#app';
import { useRouter } from '#vue-router';

interface tasks {
  type: string;
  label: string;
  description: string;
  id: any;
  executionId: any;
  progress: any;
}

const layout = 'dashboard-layout';
const selectedTask = ref<tasks[] | undefined>(undefined);
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
    name: 'description',
    label: 'Description',
    field: 'description',
    required: true,
    sortable: false,
  }
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
  const duration = endTime - startTime;
  return duration / 1000;
}

function inspectTasks( tasks ) {
  navigateToItem( `/assets/tasks/${ tasks.uuid }` );
}

const navigateToItem = ( route: string ) => {
  console.log('Navigating to route:', route);
  router.push(route);
};

// Fetch server stats and set the current section on component mount
onMounted(async () => {
  const appStore = useAppStore();
  appStore.setCurrentSection('assets');
  const response = await fetch('/api/tasks');
  if (!response.ok) throw new Error('Network response was not ok');
  const data = await response.json();
  tasks.value = data.map( r => {
    return {
      uuid: r.uuid,
      label: r.label,
      description: r.description,
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
      <taskMap v-if="selectedtask" :item="selectedtask"/>
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
  uuid: any;
}

const layout = 'dashboard-layout';
const selectedtask = ref<task | null>(null);

// Fetch the tasks data
const { data: tasks, error } = await useFetch('/api/tasks');

// Error handling
if (error.value) {
  console.error('Error fetching tasks:', error.value);
}

// Function to handle item selection
function onSelect(item: task) {
  console.log(item.label);
  selectedtask.value = item;
}

onMounted(() => {
  const appStore = useAppStore();
  appStore.setCurrentSection('assets');
});
</script> -->

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
</script> -->
