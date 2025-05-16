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
          :last-page="lastPage"
          row-key="uuid"
          @inspect-row="inspectContracts"
          @inspect-row-in-new-tab="inspectInNewTab"
          @load-more-data="loadMoreContracts"
        />
        <FrequencyPieChart v-if="contracts.length > 0" :values="contracts" />
      </div>
    </NuxtLayout>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useFetch } from '#app';
import { useRouter } from '#vue-router';

interface contracts {
  type: string;
  label: string;
  description: string;
  id: any;
  executionId: any;
  progress: any;
  uuid: string;
}

const layout = 'dashboard-layout';
const selectedContract = ref<contracts[] | undefined>(undefined);
watch(selectedContract, newValue => {});

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

const contracts = ref<contracts[]>([]);

const router = useRouter();

function formatDate(date: string) {
  const datetime = new Date(date);
  return `${datetime.toDateString()} ${datetime.toLocaleTimeString()}`;
}

function getDuration(start: number, end?: number) {
  const startTime = new Date(start);
  let endTime;
  if (!end) {
    endTime = new Date(Date.now());
  } else {
    endTime = new Date(end);
  }
  const duration = +endTime - +startTime;
  return duration / 1000;
}

function inspectContracts(contracts: contracts) {
  navigateToItem(`contracts/${contracts.uuid}`);
}
function inspectInNewTab(contracts: contracts) {
  const url = `/contracts/${contracts.uuid}`;
  window.open(url, '_blank');
}

const navigateToItem = (route: string) => {
  router.push(route);
};

const currentPage = ref(1);
const pageSize = 50;
const lastPage = ref<number>(1);

async function loadMoreContracts() {
  try {
    currentPage.value++;
    const response = await fetch(`/api/contracts?page=${currentPage.value}&limit=${pageSize}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();

    contracts.value = [...contracts.value, ...data.contracts.map((r: any) => {
      return {
        uuid: r.uuid,
        name: r.product,
        agent_id: r.agent_id,
        agent_name: r.agent_name,
        label: r.label,
        description: r.description,
        issued: formatDate(r.issued_at),
        status: r.fulfilled ? 'check' : 'schedule',
        product: r.product,
        referer: r.referer,
      };
    })];

    lastPage.value = data.lastPage;
  } catch (error) {
    console.error('Error loading more contracts:', error);
  }
}

// Fetch server stats and set the current section on component mount
onMounted(async () => {
  const appStore = useAppStore();
  appStore.setCurrentSection('contracts');
  try {
    const response = await fetch(`/api/contracts`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();

    contracts.value = data.contracts.map((r: any) => {
      return {
        uuid: r.uuid,
        name: r.product,
        agent_id: r.agent_id,
        agent_name: r.agent_name,
        label: r.label,
        description: r.description,
        issued: formatDate(r.issued_at),
        status: r.fulfilled ? 'check' : 'schedule',
        product: r.product,
        referer: r.referer,
      };
    });

    lastPage.value = data.lastPage;
    console.log('Contracts loaded on mount:', contracts.value);
  } catch (error) {
    console.error('Error fetching contracts on mount:', error);
  }
});
</script>
