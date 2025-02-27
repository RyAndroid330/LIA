<template>
  <NuxtLayout :name="layout">
    <template #title>
      Contract Elements
    </template>
    <div>
      <div class="q-pa-md">
        <q-tabs
          v-model="selectedOption"
          dense
          class="text-grey-9 bg-transparent"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="routineMap" label="Map" />
          <q-tab name="timeline" label="Timeline" />
          <q-tab name="rangedTimeline" label="Ranged Timeline" />
        </q-tabs>

        <q-separator />

        <transition name="fade" mode="out-in" :duration="{ enter: 500, leave: 300 }">
          <div v-show="selectedOption === 'routineMap'">
            <RoutineMap :routineMap="routineMap" @node-selected="onTaskSelected" />
          </div>
        </transition>
        <transition name="fade" mode="out-in" :duration="{ enter: 500, leave: 300 }">
          <div v-show="selectedOption === 'timeline'">
            <Timeline :routineMap="routineMap" />
          </div>
        </transition>
        <transition name="fade" mode="out-in" :duration="{ enter: 500, leave: 300 }">
          <div v-show="selectedOption === 'rangedTimeline'">
            <!-- <RangedTimeline :routineMap="routineMap" /> -->
            <ApexTimeline :routineMap="routineMap"/>
          </div>
        </transition>
      </div>
      <div class="row q-mx-md">
        <Table
          :columns="columns"
          :rows="routines"
          row-key="uuid"
          @inspect-row="inspectRoutine"
        />
      </div>
      <ContractHeatMap :contractId="String(route.params.id)"/>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch, useRoute } from '#app';
import { useRouter } from '#vue-router';
import ContractHeatMap from '~/components/ContractHeatMap.vue';
import ApexTimeline from '~/components/ApexTimeline.vue';


interface Routine {
  type: string;
  label: string;
  description: string;
  id: any;
  executionId: any;
  progress: any;
  uuid: string;
  contract_id: string;
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

const routines = ref<Routine[]>([]);
const router = useRouter();
const route = useRoute();
const selectedOption = ref('routineMap');
const routineMap = ref([]);

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

function inspectRoutine( routine: Routine ) {
  navigateToItem( `/activity/routines/${ routine.uuid }` );
}

const navigateToItem = ( route: string ) => {
  console.log('Navigating to route:', route);
  router.push(route);
};

function onTaskSelected(task: any) {
  console.log('selected', task);
  // Handle task selection
}

// Fetch server stats and set the current section on component mount
onMounted(async () => {
  const appStore = useAppStore();
  appStore.setCurrentSection('contracts');
  const response = await fetch('/api/activeRoutines');
  if (!response.ok) throw new Error('Network response was not ok');
  const data = await response.json();
  const contractId = route.params.id;
  routines.value = data
    .filter((r: any) => r.contract_id === contractId)
    .map((r: any) => {
      return {
        uuid: r.uuid,
        label: r.label,
        routineDescription: r.routineDescription,
        status: r.status,
        progress: r.progress,
        started: formatDate( r.started ),
        ended: formatDate( r.ended ),
        scheduled: r.created,
        layer_index: r.layer_index || 0,
        duration: getDuration( r.started, r.ended ),
        contract_id: r.contract_id,
      };
  } );
 routineMap.value = data.filter((r: any) => r.contract_id === contractId).map((r: any) => {
    return {
      ...r,
      layer_index: r.layer_index || 0, // Add this line to include layer_index
    };
  });
  // Ensure routineMap is correctly populated
  console.log('Routine Map:', routineMap.value);
});
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
