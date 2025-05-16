<template>
  <NuxtLayout name="dashboard-layout">
    <NuxtLayout name="dashboard-main-layout">
    <template #title>
      {{ selectedItem?.name }}
    </template>
    <div class="row q-mx-md">
      <TaskInServiceMap />
      <InfoCard v-if="selectedItem">
        <template #title>
          {{ selectedItem?.name }}
        </template>
        <template #info>
          <div class="flex-column full-width">
            <div class="q-mx-md q-my-sm">
              Description: {{ selectedItem?.description }}
            </div>
            <div class="q-mx-md q-my-sm">
              Modified: {{ new Date(selectedItem?.modified).toLocaleString() }}
            </div>
            <div class="q-mx-md q-my-sm">
              Deleted: {{ selectedItem?.deleted ? 'Yes' : 'No' }}
            </div>
            <div class="q-mx-md q-my-sm">
              Created: {{ new Date(selectedItem?.created).toLocaleString() }}
            </div>
          </div>
        </template>
      </InfoCard>
    </div>
      <Table
        class="custom-table"
        :columns="columns"
        :rows="activeProcesses"
        row-key="uuid"
        @inspect-row="inspectServer"
        @inspect-row-in-new-tab="inspectInNewTab"
      >
    <template #title>
      Servers Running This Service
    </template>
    </Table>
    </NuxtLayout>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch, useRouter } from '#app';
import InfoCard from '~/components/InfoCard.vue';

const router= useRouter();
const activeProcesses = ref([]);
const processingGraph = router.currentRoute.value.params.id as string;

// Update the `columns` to match the server data structure
const columns = [
  { name: 'graph', label: 'Service', field: 'graph', required: true, sortable: true },
  { name: 'address', label: 'Address', field: 'address', required: true, sortable: true },
  { name: 'port', label: 'Port', field: 'port', required: true, sortable: true },
  { name: 'status', label: 'Status', field: 'status', required: true, sortable: true },
  { name: 'processPid', label: 'Process PID', field: 'processPid', required: true, sortable: true },
];

function inspectServer(server: any) {
  navigateToItem(`/activity/servers/${server.uuid}`);
}
function inspectInNewTab(server: any) {
  const url = `/activity/servers/${server.uuid}`;
  window.open(url, '_blank');
}

const navigateToItem = (route: string) => {
  useRouter().push(route);
};

// Update the `fetchFilteredServers` function to handle the server data
const fetchFilteredServers = async () => {
  try {
    const response = await fetch(`/api/serverStats?processingGraph=${encodeURIComponent(processingGraph)}`);
    if (!response.ok) throw new Error('Failed to fetch filtered servers');
    const data = await response.json();
    activeProcesses.value = data.servers.map((server: any) => ({
      uuid: server.uuid,
      graph: server.graph,
      address: server.address,
      port: server.port,
      status: server.status,
      processPid: server.processPid,
    }));
  } catch (err) {
    console.error(err);
  }
};

const fetchGraphDetails = async () => {
  try {
    const response = await fetch(`/api/graph/${encodeURIComponent(processingGraph)}`);
    if (!response.ok) throw new Error('Failed to fetch graph details');
    const data = await response.json();
    selectedItem.value = data.graphs[0];
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  const appStore = useAppStore();
  appStore.setCurrentSection('assets');

  fetchGraphDetails();
  fetchFilteredServers();
});

// Define the Item interface
interface Item {
  name: string;
  description: string;
  modified: string;
  deleted: boolean;
  created: string;
}

const layout = 'dashboard-layout';
const selectedItem = ref<Item | null>(null);
const route = useRoute();

// Fetch the Item data
const { data: item, error } = await useFetch(`/api/graph/${encodeURIComponent(route.params.id as string)}`);

// Error handling
if (error.value) {
  console.error('Error fetching Item:', error.value);
}

// Set the selected item based on the fetched data
onMounted(() => {
  const appStore = useAppStore();
  appStore.setCurrentSection('assets');

  if (item.value && item.value.length > 0) {
    selectedItem.value = item.value[0];
  } else {
    console.error('No item found with the given name:', route.params.id);
  }

  if (!selectedItem.value) {
    console.error('No item found with the given name:', route.params.id);
  }
});
</script>

<style scoped>
.custom-table {
  background-color: #e6b30dc4;
}
</style>
