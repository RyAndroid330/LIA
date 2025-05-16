<template>
  <NuxtLayout name="dashboard-layout">
    <NuxtLayout name="dashboard-main-layout">
      <template #title>
        {{ route.params.id }}
      </template>
      <InfoCard>
        <template #title>
          <h4 class="text-xl font-bold">
            Server Status
          </h4>
        </template>
        <template #info>
          <ul>
            <li>IP: {{ serverData?.address || 'Loading...' }}</li>
            <li>PORT: {{ serverData?.port || 'Loading...' }}</li>
            <li>Status: {{ serverData?.is_active ? 'Active' : 'Inactive' }}</li>
            <li>Link to Static Asset: {{ serverData?.staticAsset || 'N/A' }}</li>
          </ul>
        </template>
      </InfoCard>
      <div>
        <!-- <ExecutionTimeChart/> -->
        <!-- <FrequencyPieChart/> -->
      </div>
    </NuxtLayout>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from '#app';

const route = ref(useRoute());
const serverData = ref<{ address?: string; port?: number; is_active?: boolean; staticAsset?: string } | null>(null);

onMounted(async () => {
  try {
    const data = await $fetch(`/api/activeServices/${route.value.params.id}`);
    serverData.value = data?.data || null;
    console.log('Server data:', serverData.value);
  } catch (error) {
    console.error('Error fetching server data:', error);
  }
});
</script>
