<template>
  <NuxtLayout :name="layout">
    <template #title>
      {{ taskExecution?.name }} - {{ taskExecution?.uuid.slice( 0, 8 ) }}
    </template>
    <div class="row q-mx-md">
      <InfoCard v-if="taskExecution">
        <template #title>
          {{ taskExecution?.name }}
        </template>
        <template #info>
          <div class="flex-column full-width">
            <div class="q-mx-md q-my-sm">
              Description: {{ taskExecution?.description }}
            </div>
            <div class="q-mx-md q-my-sm">
              Execution id: {{ taskExecution?.uuid }}
            </div>
            <div class="q-mx-md q-my-sm">
              Routine name: {{ taskExecution?.routineName }}
            </div>
            <div class="q-separator" style="height: 2px"></div>
            <div class="q-mx-md q-my-sm">
              Is unique: {{ taskExecution?.isUnique }}
            </div>
<!--            <div class="q-mx-md q-my-sm">-->
<!--              Input: {{ taskExecution?.inputContext }}-->
<!--            </div>-->
<!--            <div class="q-mx-md q-my-sm">-->
<!--              Output: {{ taskExecution?.outputContext }}-->
<!--            </div>-->
            <div class="q-separator" style="height: 2px"></div>
            <div class="q-mx-md q-my-sm">
              Progress: {{ Math.round( taskExecution?.progress * 100 ) }}%
            </div>
            <div class="q-mx-md q-my-sm">
              Started: {{ formatDate( taskExecution?.started ) }}
            </div>
            <div class="q-mx-md q-my-sm">
              Ended: {{ formatDate( taskExecution?.ended ) }}
            </div>
            <div class="q-mx-md q-my-sm">
              Duration: {{ getDuration( taskExecution?.started, taskExecution?.ended ) }} sec
            </div>
            <div class="q-separator" style="height: 2px"></div>
            <div class="q-mx-md q-my-sm">
              Success: {{ !taskExecution?.failed && !taskExecution?.errored }}
            </div>
            <div class="q-separator" style="height: 2px"></div>
            <div v-if="taskExecution?.previousTaskExecutionId" class="q-mx-md q-my-sm" @click="navigateToItem( `/executions/task/${ taskExecution?.previousTaskExecutionId }` )">
              Previous task: <span class="text-warning cursor-pointer">{{ taskExecution?.previousTaskExecutionId }}</span>
            </div>
            <div class="q-mx-md q-my-sm" @click="navigateToItem( `/routine/${ taskExecution?.routineExecutionId }` )">
              Routine execution id: <span class="text-warning cursor-pointer">{{ taskExecution?.routineExecutionId }}</span>
            </div>
            <div v-if="taskExecution?.taskId" class="q-mx-md q-my-sm" @click="navigateToItem( `/static/task/${ taskExecution?.taskId }` )">
              Task id: <span class="text-primary cursor-pointer">{{ taskExecution?.taskId }}</span>
            </div>
            <div class="q-mx-md q-my-sm" @click="navigateToItem( `/server/${ taskExecution?.serverId }` )">
              Server id: <span class="text-warning cursor-pointer">{{ taskExecution?.serverId }}</span>
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
import { useRouter } from '#vue-router';


const layout = 'dashboard-layout';
const route = useRoute();
const taskExecutionId = ref('');

const router = useRouter();

const taskExecution = computedAsync( async () => {
  if ( taskExecutionId.value ) {
    const result = await $fetch( `/api/taskExecution?=${ taskExecutionId.value }` );
    if ( result?.length ) {
      const task = result[ 0 ];
      return {
        uuid: task?.uuid,
        routineExecutionId: task?.routine_execution_id,
        taskId: task?.task_id,
        isRunning: task?.is_running,
        isComplete: task?.is_complete,
        errored: task?.errored,
        failed: task?.failed,
        progress: parseFloat( task?.progress ),
        scheduled: task?.scheduled,
        started: task?.started,
        ended: task?.ended,
        inputContext: task?.input_context,
        outputContext: task?.output_context,
        inputContextId: task?.context_id,
        outputContextId: task?.result_context_id,
        name: task?.name,
        description: task?.description,
        isUnique: task?.is_unique,
        previousTaskExecutionId: task?.previous_task_execution_id,
        serverId: task?.server_id,
        routineName: task?.routine_name,
      };
    }
  }
}, {} );

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
  const duration = +endTime - +startTime;
  return duration / 1000;
}

const navigateToItem = ( route: string ) => {
  console.log('Navigating to route:', route);
  router.push(route);
};

onMounted(() => {
  const appStore = useAppStore();
  appStore.setCurrentSection('serverActivity');

  const itemId = route.params.id as string;
  taskExecutionId.value = itemId;
});

</script>
