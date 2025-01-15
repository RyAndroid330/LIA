<template>
  <NuxtLayout :name="layout">
    <template #title>
      {{ selectedItem?.name }} - {{ selectedItem?.uuid.slice(0, 8) }}
    </template>
    <div class="row q-mx-md">
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
              Function: {{ selectedItem?.function_string }}
            </div>
            <div class="q-separator" style="height: 2px"></div>
            <div class="q-mx-md q-my-sm">
              UUID: {{ selectedItem?.uuid }}
            </div>
            <div class="q-mx-md q-my-sm">
              Type: {{ selectedItem?.type }}
            </div>
            <div class="q-mx-md q-my-sm">
              Processing Graph: {{ selectedItem?.processing_graph }}
            </div>
            <div class="q-mx-md q-my-sm">
              Created: {{ new Date(selectedItem?.created).toLocaleString() }}
            </div>
            <div class="q-mx-md q-my-sm">
              Deleted: {{ selectedItem?.deleted ? 'Yes' : 'No' }}
            </div>
          </div>
        </template>
      </InfoCard>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch, useRoute } from '#app';
import InfoCard from '~/components/InfoCard.vue';

// Define the Item interface
interface Item {
  type: string;
  name: string;
  description: string;
  function_string: string;
  id: any;
  executionId: any;
  progress: any;
  uuid: any;
  processing_graph: string;
  created: string;
  deleted: boolean;
}

const layout = 'dashboard-layout';
const selectedItem = ref<Item | null>(null);
const route = useRoute();

// Fetch the Items data
const { data: Items, error } = await useFetch(`/api/task/${route.params.id}`);

// Error handling
if (error.value) {
  console.error('Error fetching Items:', error.value);
}

// Set the selected item based on the route parameter
onMounted(() => {
  const appStore = useAppStore();
  appStore.setCurrentSection('assets');

  const itemId = route.params.id;
  selectedItem.value = Items.value?.find((item: Item) => item.uuid === itemId);
});
</script>
