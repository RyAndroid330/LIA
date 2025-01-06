<template>
  <NuxtLayout :name="layout">
    <template #title>
      {{ selectedItem?.label }}
    </template>
    <div class="row justify-around q-ma-lg">
      <Details>
        <template #title>
          {{ selectedItem?.label }}
        </template>
        <template #info>
          {{ selectedItem?.description }}
        </template>
      </Details>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch, useRoute } from '#app';

// Define the Item interface
interface Item {
  type: string;
  label: string;
  description: string;
  id: any;
  executionId: any;
  progress: any;
  uuid: any;
}

const layout = 'dashboard-layout';
const selectedItem = ref<Item | null>(null);
const route = useRoute();

// Fetch the Items data
const { data: Items, error } = await useFetch(`/api/${route.params.type}s`);

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
