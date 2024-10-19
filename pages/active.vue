<template>
  <NuxtLayout :name="layout">
    <template #title>
      Server Stats
    </template>
    <div class="row justify-around q-ma-lg">
      <ServerMap @node-selected="onServerSelected" />
      <q-dialog v-model="card">
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
                  <li>Server: {{ selectedServer?.uuid || 'N/A' }}</li>
                  <li>IP: {{ selectedServer?.address || 'N/A' }}</li>
                  <li>Status: {{ selectedServer ? (selectedServer.is_active ? 'Active' : 'Offline') : 'Unknown' }}</li>
                  <li>Uptime: {{ selectedServer?.timestamp || 'N/A' }}</li>
                </ul>
              </template>
            </Details>
          </q-card-section>
          <!-- <q-separator />
          <q-card-actions align="right">
            <q-btn
              class="transparent-background"
              color="primary"
              flat
              @mouseover="hoverBack = true"
              @mouseleave="hoverBack = false"
            >
              <q-icon
                name="arrow_back"
                :style="hoverBack ? 'transform: translateX(-5px); transition: transform 0.3s ease;' : 'transition: transform 0.3s ease;'"
              />
              <span>Back</span>
            </q-btn>
            <q-btn
              class="transparent-background"
              color="primary"
              flat
              @mouseover="hoverNext = true"
              @mouseleave="hoverNext = false"
            >
              <span style="margin-right: 8px;">Next</span>
              <q-icon
                name="arrow_forward"
                :style="hoverNext ? 'transform: translateX(5px); transition: transform 0.3s ease;' : 'transition: transform 0.3s ease;'"
              />
            </q-btn>
          </q-card-actions> -->
        </q-card>
      </q-dialog>

      <!-- <List :listLabel="'Active Processes'" :items="activeProcesses" /> -->
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAppStore } from '~/stores/app';
import ServerMap from '~/components/serverMap.vue';

const hoverBack = ref(false);
const hoverNext = ref(false);
const layout = 'dashboard-layout';
const card = ref(false);
const activeProcesses = ref([]);
const selectedServer = ref<Server | null>(null);

interface Server {
  uuid: string;
  address: string;
  is_active: boolean;
  timestamp: string;
}

const onServerSelected = (serverName: string) => {
  // Update selectedServer based on the selected server name
  selectedServer.value = activeProcesses.value.find((server: Server) => server.uuid === serverName) || activeProcesses.value[0];
  card.value = true;
};

const fetchServerStats = async () => {
  try {
    const response = await fetch('/api/serverStats');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    activeProcesses.value = data;
    selectedServer.value = activeProcesses.value[0];
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
