<template>
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
</script>
