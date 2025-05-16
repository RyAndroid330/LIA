<template>
  <NuxtLayout name="dashboard-layout">
    <NuxtLayout name="dashboard-main-layout">
    <template #title>
      Server Activity
    </template>
    <div class="row q-mx-md">
      <Table
          :columns="columns"
          :rows="servers"
          :last-page="lastPage"
          row-key="uuid"
          @inspect-row="inspectActivity"
          @inspect-row-in-new-tab="inspectInNewTab"
          @load-more-data="loadMoreservers"
      />
      <!-- <GridTable :columns="columns" :rows="activeProcesses" title="Servers" row-key="uuid" v-model:selected="selectedServer" /> -->
      <ServerMap @node-selected="onServerSelected" class="q-mx-md" />
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
</NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAppStore } from '~/stores/app';
import ServerMap from '~/components/serverMap.vue';
import { useRouter } from '#vue-router';

const router = useRouter();
const hoverBack = ref(false);
const hoverNext = ref(false);
const layout = 'dashboard-layout';
const dialogVisible = ref(false);
const activeProcesses = ref([]);
const selectedServer = ref<Server | undefined>(undefined);
const servers = ref([]); // Define the servers array
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

function inspectServer( server:Server ) {
  navigateToItem( `/activity/servers/${ server.uuid }` );
}
function inspectInNewTab( server:Server ) {
  const url = `/activity/servers/${ server.uuid }`;
  window.open(url, '_blank');
}

function inspectActivity(activity) {
  navigateToItem(`/activity/${activity.uuid}`);
}

function formatDate(date) {
  const datetime = new Date(date);
  return `${datetime.toDateString()} ${datetime.toLocaleTimeString()}`;
}

const navigateToItem = ( route: string ) => {
  router.push(route);
};

const onServerSelected = (serverUuid: string) => {
  // Update selectedServer based on the selected server uuid from the servers array
  selectedServer.value = servers.value.find((server: Server) => server.uuid === serverUuid);
  dialogVisible.value = true;
};

const fetchServerStats = async () => {
  try {
    const response = await fetch('/api/serverStats');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    activeProcesses.value = data;
  } catch (error) {
    console.error('Error fetching server stats:', error);
  }
};

const currentPage = ref(1);
const pageSize = 50;
const lastPage = ref<number>(1);

async function loadMoreservers() {
  try {
    currentPage.value++;
    const response = await fetch(`/api/serverStats?page=${currentPage.value}&limit=${pageSize}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();

    servers.value = [...servers.value, ...data.servers.map((r: any) => {
      return {
        uuid: r.uuid,
        graph: r.graph,
        address: r.address,
        port: r.port,
        status: r.status,
      };
    })];

    lastPage.value = data.lastPage;
  } catch (error) {
    console.error('Error loading more servers:', error);
  }
}

onMounted(async () => {
  const appStore = useAppStore();
  appStore.setCurrentSection('serverActivity');
  fetchServerStats();

  try {
    const response = await fetch(`/api/serverStats`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();

    servers.value = data.servers.map((r: any) => {
      return {
        uuid: r.uuid,
        graph: r.graph,
        address: r.address,
        port: r.port,
        status: r.status,
      };
    });

    lastPage.value = data.lastPage;
  } catch (error) {
    console.error('Error fetching servers on mount:', error);
  }
});
</script>
