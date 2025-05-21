<template>
  <NuxtLayout name="dashboard-layout">
    <NuxtLayout name="dashboard-main-layout">
    <template #title>
      Contract Elements
        <q-btn color="primary"  @click="showGenerateDialog = true">Regenerate Contract</q-btn>
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
            <contractMap :routineMap="routineMap" @node-selected="onTaskSelected" />
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
      <div>
        <InfoCard>
          <template #title>Input Context</template>
          <template #info>
            <div class="q-mx-md q-my-sm">
              <pre>{{ routineMap?.inputContext }}</pre>
            </div>
          </template>
        </InfoCard>
        <InfoCard>
          <template #title>Output Context</template>
          <template #info>
            <div class="q-mx-md q-my-sm">
              <pre>{{ routineMap?.outputContext }}</pre>
            </div>
          </template>
        </InfoCard>
      </div>
      <!-- <ContractHeatMap :contractId="String(route.params.id)"/> -->
    </div>
    <q-dialog v-model="showGenerateDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirm Generate</div>
          <div>Are you sure you want to generate a contract?</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="showGenerateDialog = false" />
          <q-btn flat label="Confirm" color="secondary" @click="confirmGenerate" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </NuxtLayout>
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
  router.push(route);
};

function onTaskSelected(task: any) {
  // Handle task selection
}

const showStopDialog = ref(false);
const showGenerateDialog = ref(false);
function confirmStop() {
  showStopDialog.value = false;
  // Add logic to handle stopping the process
}

function confirmGenerate() {
  showGenerateDialog.value = false;
  // Add logic to handle generating the contract
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
        description: r.routineDescription,
        status: r.isComplete ? 'check' : r.isRunning ? 'play_arrow' : 'schedule',
        progress: r.progress,
        started: formatDate( r.started ),
        ended: formatDate( r.ended ),
        scheduled: r.created,
        layer_index: r.layer_index || 0,
        duration: getDuration( r.started, r.ended ),
        contract_id: r.contract_id,
        errored: r.errored,
        contextId: r.context_id,
        inputContext: r.input_context,
        outputContext: r.output_context,
      };
    } );
    routineMap.value = data.filter((r: any) => r.contract_id === contractId).map((r: any) => {
      return {
        ...r,
        layer_index: r.layer_index || 0,
        errored: r.status === 'Errored',
        previousTaskExecutionId: r.previousRoutineExecution, // beacues the component is built for the active routine page it is looking fo the TaskExecutionId
        inputContext: r.input_context,
        outputContext: r.output_context,
        description: r.routineDescription,
    };
  });
  console.log(routineMap.value);
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
