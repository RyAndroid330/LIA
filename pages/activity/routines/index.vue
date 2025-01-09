<template>
  <NuxtLayout :name="layout">
    <template #title>
      Routine executions
    </template>
    <div class="row q-mx-md">
      <Table
          :columns="columns"
          :rows="routines"
          row-key="uuid"
          @inspect-row="inspectRoutine"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch } from '#app';
import { useRouter } from '#vue-router';

interface Routine {
  type: string;
  label: string;
  description: string;
  id: any;
  executionId: any;
  progress: any;
}

const layout = 'dashboard-layout';
const selectedRoutine = ref<Routine[] | undefined>(undefined);
watch( selectedRoutine, newValue => {
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
    name: 'routineDescription',
    label: 'Description',
    field: 'routineDescription',
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

const routines = ref( [] );

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

function inspectRoutine( routine ) {
  navigateToItem( `/activity/routines/${ routine.uuid }` );
}

const navigateToItem = ( route: string ) => {
  console.log('Navigating to route:', route);
  router.push(route);
};

// Fetch server stats and set the current section on component mount
onMounted(async () => {
  const appStore = useAppStore();
  appStore.setCurrentSection('serverActivity');
  const response = await fetch('/api/activeRoutines');
  if (!response.ok) throw new Error('Network response was not ok');
  const data = await response.json();
  routines.value = data.map( r => {
    return {
      uuid: r.uuid,
      label: r.label,
      routineDescription: r.routineDescription,
      status: r.status,
      progress: r.progress,
      started: formatDate( r.started ),
      ended: formatDate( r.ended ),
      duration: getDuration( r.started, r.ended ),
    };
  } );
});
</script>
