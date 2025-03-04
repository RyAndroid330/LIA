<template>
  <NuxtLayout :name="layout">
    <template #title>
      {{ selectedItem?.name }}
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
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch, useRoute } from '#app';
import InfoCard from '~/components/InfoCard.vue';

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
  console.log(selectedItem.value);
});
</script>
