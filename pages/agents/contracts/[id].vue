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
    </div>
      <div>
        <div>
          <div class="justify-around flex w-full gap-4">
          <InfoCard>
            <template #title>
              {{ contractContext?.product || 'Contract Info' }}
          </template>
          <template #info>
            <div class="flex-column full-width">
              <div class="q-mx-md q-my-sm">
                Agent: {{ contractContext?.agent_name }}
              </div>
              <div class="q-mx-md q-my-sm">
                Issued at: {{ contractContext?.issued_at ? formatDate(contractContext.issued_at) : '' }}
              </div>
              <div class="q-mx-md q-my-sm">
                Fulfilled: <span :class="contractContext?.fulfilled ? 'text-positive' : 'text-negative'">
                  {{ contractContext?.fulfilled ? 'Yes' : 'No' }}
                </span>
              </div>
              <div class="q-mx-md q-my-sm">
                Fulfilled at: {{ contractContext?.fulfilled_at ? formatDate(contractContext.fulfilled_at) : '' }}
              </div>
              <div class="q-mx-md q-my-sm">
                Description: {{ contractContext?.description }}
              </div>
              <div class="q-mx-md q-my-sm">
                Contract UUID: {{ contractContext?.uuid }}
              </div>
            </div>
          </template>
        </InfoCard>
        <div>
          <InfoCard>
            <template #title>Input Context</template>
            <template #info>
              <div class="q-mx-md q-my-sm">
                <pre>{{ contractContext?.input_context }}</pre>
              </div>
            </template>
          </InfoCard>
          <InfoCard>
            <template #title>Output Context</template>
            <template #info>
              <div class="q-mx-md q-my-sm">
                <pre>{{ contractContext?.output_context }}</pre>
              </div>
            </template>
          </InfoCard>
        </div>
      </div>
    </div>
      <Table
        :columns="columns"
        :rows="routines"
        row-key="uuid"
        :lastPage="lastPage"
        @inspect-row="inspectRoutine"
      />
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

const showGenerateDialog = ref(false);
const contractContext = ref<any>(null);
const routines = ref<any[]>([]);
const router = useRouter();
const route = useRoute();
const selectedOption = ref('routineMap');
const routineMap = ref([]);
const lastPage = ref(1);

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

function inspectRoutine(routine: any) {
  router.push(`/activity/routines/${routine.uuid}`);
}

function onTaskSelected(task: any) {
  // Handle task selection
}

function confirmGenerate() {
  showGenerateDialog.value = false;
  // Add logic to handle generating the contract
}

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
        started: formatDate(r.started),
        ended: formatDate(r.ended),
        scheduled: r.created,
        layer_index: r.layer_index || 0,
        duration: getDuration(r.started, r.ended),
        contract_id: r.contract_id,
        errored: r.errored,
        contextId: r.context_id,
        inputContext: r.input_context,
        outputContext: r.output_context,
      };
    });
  routineMap.value = data.filter((r: any) => r.contract_id === contractId).map((r: any) => {
    return {
      ...r,
      layer_index: r.layer_index || 0,
      errored: r.status === 'Errored',
      previousTaskExecutionId: r.previousRoutineExecution,
      inputContext: r.input_context,
      outputContext: r.output_context,
      description: r.routineDescription,
    };
  });
  // Fetch contract context from /api/contracts?uuid=...
  const contractRes = await fetch(`/api/contracts?uuid=${contractId}`);
  if (contractRes.ok) {
    const contractData = await contractRes.json();
    contractContext.value = contractData.contracts?.[0] || null;
    lastPage.value = contractData.lastPage || 1;
  }
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
