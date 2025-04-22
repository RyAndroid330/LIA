<template>
  <NuxtLayout name="dashboard-layout">
    <NuxtLayout name="dashboard-main-layout">
    <template #title>
      Routines
    </template>
    <div class="row q-mx-md">
      <Table
          :columns="columns"
          :rows="routines"
          row-key="uuid"
          @inspect-row="inspectRoutines"
          @inspect-row-in-new-tab="inspectInNewTab"
      />
    </div>
  </NuxtLayout>
</NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch } from '#app';
import { useRouter } from '#vue-router';

interface routines {
  type: string;
  label: string;
  service: string;
  id: any;
  executionId: any;
  progress: any;
  uuid: string;
}

const layout = 'dashboard-layout';
const selectedRoutine = ref<routines[] | undefined>(undefined);

const columns = [
  {
    name: 'label',
    label: 'Name',
    field: 'label',
    required: true,
    sortable: true,
  },
  {
    name: 'service',
    label: 'Service',
    field: 'service',
    required: true,
    sortable: false,
  }
];

const routines = ref( [] );

const router = useRouter();

function inspectRoutines( routines: routines ) {
  navigateToItem( `/assets/routines/${ routines.uuid }` );
}
function inspectInNewTab( routine: routines ) {
  const url = `/assets/routines/${ routine.uuid }`;
  window.open(url, '_blank');
}

const navigateToItem = ( route: string ) => {
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
      service: r.service,
      description: r.description,
    };
  } );
});
</script>
