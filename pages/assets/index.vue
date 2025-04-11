<template>
  <NuxtLayout :name="layout">
    <template #title>
      Graphs
    </template>
    <div class="row q-mx-md">
      <Table
          :columns="columns"
          :rows="graphs"
          row-key="uuid"
          @inspect-row="inspectGraphs"
          @inspect-row-in-new-tab="inspectInNewTab"
          :hideGenerateContractButton="true"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch } from '#app';
import { useRouter } from '#vue-router';
import { useAppStore } from '@/stores/app';

interface graphs {
  type: string;
  label: string;
  description: string;
  id: any;
  executionId: any;
  progress: any;
  uuid: string;
}

const layout = 'dashboard-layout';
const selectedGraph = ref<graphs[] | undefined>(undefined);

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

const graphs = ref( [] );

const router = useRouter();
function inspectGraphs(graph: graphs) {
  navigateToItem(`/assets/${graph.uuid}`);
}

function inspectInNewTab( graphs:graphs ) {
  const url = `/assets/${ graphs.uuid }`;
  window.open(url, '_blank');
}
const navigateToItem = ( route: string ) => {
  router.push(route);
};

// Fetch server stats and set the current section on component mount
onMounted(async () => {
  const appStore = useAppStore();
  appStore.setCurrentSection('assets');
  const response = await fetch('/api/graphs');
  if (!response.ok) throw new Error('Network response was not ok');
  const data = await response.json();
  graphs.value = data.map( (r: any) => {
    return {
      uuid: r.uuid,
      label: r.label,
      description: r.description,
    };
  } );
});
</script>
