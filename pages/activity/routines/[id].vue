<template>
  <NuxtLayout :name="layout">
    <template #title>
      {{ selectedItem?.label }} - {{ selectedItem?.uuid.slice( 0, 8 ) }}
    </template>
    <div class="row q-mx-md">
      <RoutineMap :routineMap="routineMap" @node-selected="onTaskSelected" />
      <InfoCard v-if="selectedItem">
        <template #title>
          {{ selectedItem?.label }}
        </template>
        <template #info>
          <div class="flex-column full-width">
            <div class="q-mx-md q-my-sm">
              Description: {{ selectedItem?.routineDescription }}
            </div>
            <div class="q-mx-md q-my-sm">
              Executed tasks: {{ routineMap?.length ?? 0 }}
            </div>
            <div class="q-separator" style="height: 2px"></div>
            <div class="q-mx-md q-my-sm">
              Progress: {{ selectedItem?.progress }}
            </div>
            <div class="q-mx-md q-my-sm">
              Started: {{ formatDate( selectedItem?.started ) }}
            </div>
            <div class="q-mx-md q-my-sm">
              Ended: {{ formatDate( selectedItem?.ended ) }}
            </div>
            <div class="q-mx-md q-my-sm">
              Duration: {{ getDuration( selectedItem?.started, selectedItem?.ended ) }} sec
            </div>
            <div class="q-separator" style="height: 2px"></div>
            <div class="q-mx-md q-my-sm">
              Status: {{ selectedItem.status }}
            </div>
            <div class="q-separator" style="height: 2px"></div>
            <div v-if="selectedItem?.routineId" class="q-mx-md q-my-sm" @click="navigateToItem( `/static/routine/${ selectedItem?.routineId }` )">
              Routine id: <span class="text-primary cursor-pointer">{{ selectedItem?.routineId }}</span>
            </div>
            <div class="q-mx-md q-my-sm" @click="navigateToItem( `/server/${ selectedItem?.serverId }` )">
              Server id: <span class="text-warning cursor-pointer">{{ selectedItem?.serverId }}</span>
            </div>
            <div v-if="selectedItem?.previousRoutineExecution" class="q-mx-md q-my-sm" @click="navigateToItem( `/executions/routine/${ selectedItem?.previousRoutineExecution }` )">
              Previous routine: {{ selectedItem?.previousRoutineExecution }}
            </div>
          </div>
        </template>
      </InfoCard>
    </div>
    <div class="row q-mx-md">
      <InfoCard v-if="selectedTask">
        <template #title>
          {{ selectedTask?.name }}
        </template>
        <template #info>
          <div class="flex-column full-width">
            <div class="q-mx-md q-my-sm">
              Description: {{ selectedTask?.description }}
            </div>
            <div class="q-mx-md q-my-sm" @click="navigateToItem( `/executions/task/${ selectedTask?.uuid }` )">
              Execution id: <span class="text-warning cursor-pointer">{{ selectedTask?.uuid }}</span>
            </div>
            <div class="q-separator" style="height: 2px"></div>
            <div class="q-mx-md q-my-sm">
              Progress: {{ Math.round( selectedTask?.progress * 100 ) }}%
            </div>
            <div class="q-mx-md q-my-sm">
              Started: {{ formatDate( selectedTask?.started ) }}
            </div>
            <div class="q-mx-md q-my-sm">
              Ended: {{ formatDate( selectedTask?.ended ) }}
            </div>
            <div class="q-mx-md q-my-sm">
              Duration: {{ getDuration( selectedTask?.started, selectedTask?.ended ) }} sec
            </div>
            <div class="q-separator" style="height: 2px"></div>
            <div class="q-mx-md q-my-sm">
              Success: {{ !selectedTask?.failed && !selectedTask?.errored }}
            </div>
            <div class="q-separator" style="height: 2px"></div>
            <div v-if="selectedTask?.previousTaskExecutionId" class="q-mx-md q-my-sm" @click="navigateToItem( `/executions/task/${ selectedTask?.previousTaskExecutionId }` )">
              Previous task: <span class="text-warning cursor-pointer">{{ selectedTask?.previousTaskExecutionId }}</span>
            </div>
            <div v-if="selectedTask?.taskId" class="q-mx-md q-my-sm" @click="navigateToItem( `/static/task/${ selectedTask?.taskId }` )">
              Task id: <span class="text-primary cursor-pointer">{{ selectedTask?.taskId }}</span>
            </div>
            <div class="q-mx-md q-my-sm" @click="navigateToItem( `/server/${ selectedTask?.serverId }` )">
              Server id: <span class="text-warning cursor-pointer">{{ selectedTask?.serverId }}</span>
            </div>
          </div>
        </template>
      </InfoCard>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from '#app';
import { ref, onMounted } from 'vue';
import { VueFlow } from '@vue-flow/core';
import { useRouter } from '#vue-router';

const layout = 'dashboard-layout';
const selectedItem = ref<Object | null | undefined>(null);
const route = useRoute();
const selectedTask = ref<string | null>(null);
const dialogVisible = ref(false);

const routineMap = computedAsync( async () => {
  if ( selectedItem.value ) {
    const tasks = await $fetch( `/api/tasksInRoutines?routineId=${ selectedItem.value.uuid }` );
    return tasks.map( task => {
      return {
        label: task.name,
        uuid: task.uuid,
        taskId: task.task_id,
        contextId: task.context_id,
        resultContextId: task.result_context_id,
        isRunning: task.is_running,
        isComplete: task.is_complete,
        errored: task.errored,
        failed: task.failed,
        progress: task.progress,
        started: task.started,
        ended: task.ended,
        previousTaskExecutionId: task.previous_task_execution_id,
        name: task.name,
        description: task.description,
        processingGraph: task.processing_graph,
        isUnique: task.is_unique,
        serverId: task.server_id,
      };
    } );
  }
}, [] );

const { data: Items, error } = await useFetch('/api/activeRoutines');
const router = useRouter();

function onTaskSelected( task ) {
  console.log( 'selected', task );
  selectedTask.value = task;
  dialogVisible.value = true;
}

function formatDate( date: string ) {
  if ( !date ) {
    return 'Not finished';
  }
  const datetime = new Date( date );
  return `${ datetime.toDateString() } ${ datetime.toLocaleTimeString() }`;
}

function getDuration( start, end ) {
  const startTime = new Date( start );
  let endTime;
  if ( !end ) {
    endTime = new Date( Date.now() );
  } else {
    endTime = new Date( end );
  }
  const duration = endTime - startTime;
  return duration / 1000;
}

const navigateToItem = ( route: string ) => {
  console.log('Navigating to route:', route);
  router.push(route);
};

onMounted(() => {
  const appStore = useAppStore();
  appStore.setCurrentSection('serverActivity');

  const itemId = route.params.id;
  selectedItem.value = Items.value?.find((item: Object) => item.uuid === itemId);
});

</script>