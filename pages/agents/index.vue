<template>
  <NuxtLayout name="dashboard-layout">
    <NuxtLayout name="dashboard-main-layout">
    <template #title>
      Agents
    </template>
    <div class="row q-mx-md">
      <Table
          :columns="columns"
          :rows="agents"
          row-key="uuid"
          @inspect-row="inspectAgents"
          @inspect-row-in-new-tab="inspectInNewTab"
          :hideGenerateContractButton="true"
      />
    </div>
  </NuxtLayout>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch } from '#app';
import { useRouter } from '#vue-router';

interface agents {
  type: string;
  label: string;
  description: string;
  id: any;
  executionId: any;
  progress: any;
  uuid:string;
}

const layout = 'dashboard-layout';
const selectedAgent = ref<agents[] | undefined>(undefined);
watch( selectedAgent, newValue => {
  console.log( newValue );
} );

const columns = [
  {
    name: 'name',
    label: 'Name',
    field: 'name',
    required: true,
    sortable: true,
  },
];

const agents = ref( [] );

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

function inspectAgents( agents:agents ) {
  navigateToItem( `/agents/${ agents.uuid }` );
}

function inspectInNewTab( agents:agents ) {
  const url = `/agents/${ agents.uuid }`;
  window.open(url, '_blank');
}
const navigateToItem = ( route: string ) => {
  router.push(route);
};

// Fetch server stats and set the current section on component mount
onMounted(async () => {
  const appStore = useAppStore();
  appStore.setCurrentSection('contracts');
  const response = await fetch('/api/agents');
  if (!response.ok) throw new Error('Network response was not ok');
  const data = await response.json();
  agents.value = data.map( (r: any) => {
    return {
      uuid: r.uuid,
      name: r.name,
      agent_id: r.agent_id,
      label: r.label,
      description: r.description,
    };
  } );
});
</script>
