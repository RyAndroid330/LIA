<template>
  <NuxtLayout :name="layout">
    <template #title>
      {{ selectedItem?.product }}
    </template>
    <div class="row q-mx-md">
      <InfoCard v-if="selectedItem">
        <template #title>
          {{ selectedItem?.product }}
        </template>
        <template #info>
          <div class="flex-column full-width">
            <div class="q-mx-md q-my-sm">
              UUID: {{ selectedItem?.uuid }}
            </div>
            <div class="q-mx-md q-my-sm">
              Agent: {{ selectedItem?.agent_id }}
            </div>
            <div class="q-mx-md q-my-sm">
              Context: {{ selectedItem?.context }}
            </div>
            <div class="q-separator" style="height: 2px"></div>
            <div class="q-mx-md q-my-sm">
              Fulfilled: {{ new Date(selectedItem?.fulfilled_at).toLocaleString() }}
            </div>
            <div class="q-mx-md q-my-sm">
              Issued: {{ new Date(selectedItem?.issued_at).toLocaleString() }}
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
  issued_at: string;
  product: string;
  agent_id: string;
  context: string;
  uuid: any;
  fulfilled_at: string;
  created: string;
}

const layout = 'dashboard-layout';
const selectedItem = ref<Item | null>(null);
const route = useRoute();

// Fetch the Items data
const { data: Items, error } = await useFetch(`/api/contract/${route.params.id}`);

// Error handling
if (error.value) {
  console.error('Error fetching Items:', error.value);
}

// Set the selected item based on the route parameter
onMounted(() => {
  const appStore = useAppStore();
  appStore.setCurrentSection('something');

  const itemId = route.params.id;
  selectedItem.value = Items.value?.find((item: Item) => item.uuid === itemId);
});
</script>
