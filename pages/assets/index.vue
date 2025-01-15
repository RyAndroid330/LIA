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
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch } from '#app';
import { useRouter } from '#vue-router';

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
watch( selectedGraph, newValue => {
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

const graphs = ref( [] );

const router = useRouter();

// function formatDate( date: string ) {
//   const datetime = new Date( date );
//   return `${ datetime.toDateString() } ${ datetime.toLocaleTimeString() }`;
// }

// function getDuration( start: number, end?: number ) {
//   const startTime = new Date( start );
//   let endTime;
//   if ( !end ) {
//     endTime = new Date( Date.now() );
//   } else {
//     endTime = new Date( end );
//   }
//   const duration = +endTime - +startTime;
//   return duration / 1000;
// }

function inspectGraphs(graph: graphs) {
  navigateToItem(`/assets/${graph.uuid}`);
}

const navigateToItem = ( route: string ) => {
  console.log('Navigating to route:', route);
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




<!-- <template>
  <NuxtLayout :name="layout">
    <template #title>
      Graphs
    </template>
    <div class="row justify-around q-ma-lg">
      <List
        v-if="graphs"
        :listLabel="'Graphs'"
        :items="graphs"
        @item-selected="onSelect"
      />
      <graphMap v-if="selectedGraph" :item="selectedGraph"/>
      <InfoCard v-if="selectedGraph">
        <template #title>
          {{ selectedGraph?.label }}
        </template>
        <template #info>
          {{ selectedGraph?.description }}
        </template>
      </InfoCard>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch } from '#app';

interface Graph {
  type: string;
  label: string;
  description: string;
  id: any;
  executionId: any;
  progress: any;
  uuid: any;
}

const layout = 'dashboard-layout';
const selectedGraph = ref<Graph | null>(null);

// Fetch the graphs data
const { data: graphs, error } = await useFetch('/api/graphs');

// Error handling
if (error.value) {
  console.error('Error fetching graphs:', error.value);
}

// Function to handle item selection
function onSelect(item: Graph) {
  console.log(item.label);
  selectedGraph.value = item;
}

onMounted(() => {
  const appStore = useAppStore();
  appStore.setCurrentSection('assets');
});
</script> -->
