<template>
  <NuxtLayout name="dashboard-layout">
    <NuxtLayout name="dashboard-main-layout">
    <template #title>
      Tasks
    </template>
    <div class="row q-mx-md">
      <Table
          :columns="columns"
          :rows="tasks"
          row-key="uuid"
          @inspect-row="inspectTasks"
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

interface tasks {
  type: string;
  label: string;
  description: string;
  id: any;
  executionId: any;
  progress: any;
  uuid:string;
}

const layout = 'dashboard-layout';
const selectedTask = ref<tasks[] | undefined>(undefined);
watch( selectedTask, newValue => {
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
    name: 'service',
    label: 'Service',
    field: 'service',
    required: true,
    sortable: false,
  },
  {
    name: 'unique',
    label: 'Unique',
    field: 'unique',
    required: true,
    sortable: true,
  }
];

const tasks = ref( [] );

const router = useRouter();

function inspectTasks( tasks:tasks ) {
  navigateToItem( `/assets/tasks/${ tasks.uuid }` );
}
function inspectInNewTab( tasks:tasks ) {
  const url = `/assets/tasks/${ tasks.uuid }`;
  window.open(url, '_blank');
}

const navigateToItem = ( route: string ) => {
  router.push(route);
};

// Fetch server stats and set the current section on component mount
onMounted(async () => {
  const appStore = useAppStore();
  appStore.setCurrentSection('assets');

  // Fetch tasks
  let response = await fetch('/api/tasks');
  if (!response.ok) throw new Error('Network response was not ok');
  let data = await response.json();
  tasks.value = data.map((r: any) => {
    return {
      uuid: r.uuid,
      label: r.label,
      service: r.graph,
      unique: r.unique,
      description: r.description,
      concurrency: r.concurrency,
    };
  });
});
</script>
