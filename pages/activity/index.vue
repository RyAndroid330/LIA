<template>
  <NuxtLayout :name="layout">
    <template #title>
      Server Activity
    </template>
    <div class="row q-mx-md">
      <GridTable :columns="columns" :rows="activeProcesses" title="Servers" row-key="uuid" v-model:selected="selectedServer"/>
      <ServerMap @node-selected="onServerSelected" />
    </div>
    <q-dialog v-model="dialogVisible">
      <q-card class="my-card">
        <q-card-section>
          <div class="row no-wrap items-center">
            <div class="col text-h6 ellipsis">Server Status</div>
          </div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <ServerStats v-if="selectedServer" :selectedServer="selectedServer" />
          <Details>
            <template #title>
              Server Info
            </template>
            <template #info>
              <ul>
                <li>Service: {{ selectedServer?.graph || 'Unknown service' }}</li>
                <li>Server: {{ selectedServer?.uuid || 'N/A' }}</li>
                <li>IP: {{ selectedServer?.address || 'N/A' }}</li>
                <li>PORT: {{ selectedServer?.port || 'N/A' }}</li>
                <li>Status: {{ selectedServer ? (selectedServer.active ? 'Active' : 'Offline') : 'Unknown' }}</li>
              </ul>
            </template>
          </Details>
        </q-card-section>
      </q-card>
    </q-dialog>

  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAppStore } from '~/stores/app';
import ServerMap from '~/components/serverMap.vue';

const hoverBack = ref(false);
const hoverNext = ref(false);
const layout = 'dashboard-layout';
const dialogVisible = ref(false);
const activeProcesses = ref([]);
const selectedServer = ref<Server | undefined>(undefined);
const columns = [
  {
    name: 'graph',
    label: 'Service',
    field: 'graph',
    required: true,
    sortable: true,
  },
  {
    name: 'address',
    label: 'Address',
    field: 'address',
    required: true,
    sortable: true,
  },
  {
    name: 'port',
    label: 'Port',
    field: 'port',
    required: true,
    sortable: true,
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    required: true,
    sortable: true,
  },
];

interface Server {
  uuid: string;
  address: string;
  is_active: boolean;
  timestamp: string;
  processing_graph: string;
  graph: string;
  port: string;
  active: boolean;
}

const onServerSelected = (serverName: string) => {
  // Update selectedServer based on the selected server name
  selectedServer.value = activeProcesses.value.find((server: Server) => server.uuid === serverName);
  dialogVisible.value = true;
};

const fetchServerStats = async () => {
  try {
    const response = await fetch('/api/serverStats');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    console.log( data );
    activeProcesses.value = data;
  } catch (error) {
    console.error('Error fetching server stats:', error);
  }
};

// Fetch server stats and set the current section on component mount
onMounted(() => {
  const appStore = useAppStore();
  appStore.setCurrentSection('serverActivity');
  fetchServerStats();
});
</script>
