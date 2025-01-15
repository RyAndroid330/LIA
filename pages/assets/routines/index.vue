<template>
  <NuxtLayout :name="layout">
    <template #title>
      Routines
    </template>
    <div class="row q-mx-md">
      <Table
          :columns="columns"
          :rows="routines"
          row-key="uuid"
          @inspect-row="inspectRoutines"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch } from '#app';
import { useRouter } from '#vue-router';

interface routines {
  type: string;
  label: string;
  description: string;
  id: any;
  executionId: any;
  progress: any;
  uuid: string;
}

const layout = 'dashboard-layout';
const selectedRoutine = ref<routines[] | undefined>(undefined);
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
    name: 'description',
    label: 'Description',
    field: 'description',
    required: true,
    sortable: false,
  }
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

function inspectRoutines( routines: routines ) {
  navigateToItem( `/assets/routines/${ routines.uuid }` );
}

const navigateToItem = ( route: string ) => {
  console.log('Navigating to route:', route);
  router.push(route);
};

// Fetch server stats and set the current section on component mount
onMounted(async () => {
  const appStore = useAppStore();
  appStore.setCurrentSection('assets');
  const response = await fetch('/api/routines');
  if (!response.ok) throw new Error('Network response was not ok');
  const data = await response.json();
  routines.value = data.map( (r: any) => {
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
      routines
    </template>
    <div class="row justify-around q-ma-lg">
      <List
        v-if="routines"
        :listLabel="'routines'"
        :items="routines"
        @item-selected="onSelect"
      />
      <routineMap v-if="selectedroutine" :item="selectedroutine"/>
      <InfoCard v-if="selectedroutine">
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

interface routine {
  type: string;
  label: string;
  description: string;
  id: any;
  executionId: any;
  progress: any;
  uuid: any;
}

const layout = 'dashboard-layout';
const selectedroutine = ref<routine | null>(null);

// Fetch the routines data
const { data: routines, error } = await useFetch('/api/routines');

// Error handling
if (error.value) {
  console.error('Error fetching routines:', error.value);
}

// Function to handle item selection
function onSelect(item: routine) {
  console.log(item.label);
  selectedroutine.value = item;
}

onMounted(() => {
  const appStore = useAppStore();
  appStore.setCurrentSection('assets');
});
</script> -->



<!-- <template>
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
      <InfoCard v-if="selectedroutine">
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
</script> -->
