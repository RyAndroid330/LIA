<template>
  <NuxtLayout name="dashboard-layout">
    <NuxtLayout name="dashboard-main-layout">
    <template #title>
      Contracts
    </template>
    <div class="row q-mx-md">
      <Table
          :columns="columns"
          :rows="contracts"
          row-key="uuid"
          @inspect-row="inspectContracts"
          @inspect-row-in-new-tab="inspectInNewTab"
      />
      <FrequencyPieChart v-if="contracts.length > 0" :values="contracts" />
    </div>
  </NuxtLayout>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch } from '#app';
import { useRouter } from '#vue-router';

interface contracts {
  type: string;
  label: string;
  description: string;
  id: any;
  executionId: any;
  progress: any;
  uuid:string;
}

const layout = 'dashboard-layout';
const selectedContract = ref<contracts[] | undefined>(undefined);
watch( selectedContract, newValue => {
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
    name: 'agent_name',
    label: 'Agent',
    field: 'agent_name',
    required: true,
    sortable: false,
  },
  {
    name: 'issued',
    label: 'Issued',
    field: 'issued',
    required: true,
    sortable: true,
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    required: true,
    sortable: true,
  }
];

const contracts = ref( [] );

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

function inspectContracts( contracts:contracts ) {
  navigateToItem( `contracts/${ contracts.uuid }` );
}
function inspectInNewTab( contracts:contracts ) {
  const url = `/contracts/${ contracts.uuid }`;
  window.open(url, '_blank');
}

const navigateToItem = ( route: string ) => {
  router.push(route);
};

// Fetch server stats and set the current section on component mount
onMounted(async () => {
  const appStore = useAppStore();
  appStore.setCurrentSection('contracts');
  const response = await fetch('/api/contracts');
  if (!response.ok) throw new Error('Network response was not ok');
  const data = await response.json();
  contracts.value = data.map( (r: any) => {
    return {
      uuid: r.uuid,
      name: r.product,
      agent_id: r.agent_id,
      agent_name: r.agent_name,
      label: r.label,
      description: r.description,
      issued: formatDate( r.issued_at ),
      status: r.fulfilled ? 'check' : 'schedule', // Ensure correct icon names
      product: r.product,
      referer: r.referer
    };
  } );
});
</script>
