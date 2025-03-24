<template>
  <NuxtLayout :name="layout">
    <template #title>
      {{ selectedItem?.label }} - {{ selectedItem?.uuid.slice( 0, 8 ) }}
    </template>
    <div>
      <div class="q-pa-md">
        <q-tabs
          v-model="selectedOption"
          dense
          class="text-grey-9 bg-transparent"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="routineMap" label="Map" />
          <q-tab name="timeline" label="Timeline" />
          <q-tab name="rangedTimeline" label="Ranged Timeline" />
        </q-tabs>

        <q-separator />

        <transition name="fade" mode="out-in" :duration="{ enter: 500, leave: 300 }">
          <div v-show="selectedOption === 'routineMap'">
            <RoutineMap :routineMap="routineMap" @node-selected="onTaskSelected" />
          </div>
        </transition>
        <transition name="fade" mode="out-in" :duration="{ enter: 500, leave: 300 }">
          <div v-show="selectedOption === 'timeline'">
            <Timeline :routineMap="routineMap" />
          </div>
        </transition>
        <transition name="fade" mode="out-in" :duration="{ enter: 500, leave: 300 }">
          <div v-show="selectedOption === 'rangedTimeline'">
             <ApexTimeline :routineMap="routineMap"/>
          </div>
        </transition>
      </div>
      <div class="row q-mx-md justify-around">
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
            <div class="flex">
              <div>
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
              </div>
              <ProgressRadialBarChart v-if="selectedItem" :name="selectedItem?.label" :value="selectedItem.progress.toString()" />
        </div>
            <div class="q-separator" style="height: 2px"></div>
            <div class="q-mx-md q-my-sm">
              Status: {{ selectedItem.status }}
            </div>
            <div class="q-separator" style="height: 2px"></div>
            <div v-if="selectedItem?.routineId" class="q-mx-md q-my-sm" @click="navigateToItem( `/assets/routines/${ selectedItem?.routineId }` )">
              Routine id: <span class="text-primary cursor-pointer">{{ selectedItem?.label }}</span>
            </div>
            <div class="q-mx-md q-my-sm" @click="navigateToItem( `/assets/${ selectedItem?.serverName }` )">
              Server id: <span class="text-primary cursor-pointer">{{ selectedItem?.serverName }}</span>
            </div>
            <div v-if="selectedItem?.previousRoutineExecution" class="q-mx-md q-my-sm " @click="navigateToItem( `/activity/routines/${ selectedItem?.previousRoutineExecution }` )">
              Previous routine:<span class="text-warning cursor-pointer"> {{ selectedItem?.previousRoutineName }}</span>
            </div>
            <div class="q-mx-md q-my-sm" @click="navigateToItem( `/contracts/${ selectedItem?.contract_id }` )">
              <span class="text-secondary cursor-pointer">Contract</span>
            </div>
          </div>
        </template>
      </InfoCard>
      <InfoCard v-if="selectedTask">
        <template #title>
          {{ selectedTask?.name }}
        </template>
        <template #info>
          <div class="flex-column full-width">
            <div class="q-mx-md q-my-sm">
              Description: {{ selectedTask?.description }}
            </div>
            <div class="q-mx-md q-my-sm" @click="navigateToItem( `/activity/tasks/${ selectedTask?.uuid }` )">
              Execution id: <span class="text-warning cursor-pointer">{{ selectedTask?.label }}</span>
            </div>
            <div class="q-separator" style="height: 2px"></div>
            <div class="flex">
              <div>
                <div class="q-mx-md q-my-sm">
                  Progress: {{ selectedTask.progress }}%
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
              </div>
              <ProgressRadialBarChart v-if="selectedTask" :key="selectedTask.uuid" :name="selectedTask?.label" :value="selectedTask.progress.toString()" />
            </div>
            <div class="q-separator" style="height: 2px"></div>
            <div class="q-mx-md q-my-sm">
              Success: {{ !selectedTask?.failed && !selectedTask?.errored }}
            </div>
            <div class="q-separator" style="height: 2px"></div>
            <div v-if="selectedTask?.previousTaskExecutionId" class="q-mx-md q-my-sm" @click="navigateToItem( `/activity/tasks/${ selectedTask?.previousTaskExecutionId }` )">
              Previous task: <span class="text-warning cursor-pointer">{{ selectedTask?.previous_task_name }}</span>
            </div>
            <div v-if="selectedTask?.taskId" class="q-mx-md q-my-sm" @click="navigateToItem( `/assets/tasks/${ selectedTask?.taskId }` )">
              Task id: <span class="text-primary cursor-pointer">{{ selectedTask?.label }}</span>
            </div>
            <div class="q-mx-md q-my-sm" @click="navigateToItem( `/assets/${ selectedItem?.serverName }` )">
              Server id: <span class="text-primary cursor-pointer">'{{ selectedTask?.serverName }}'</span>
            </div>
          </div>
        </template>
      </InfoCard>
    </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from '#app';
import { ref, onMounted } from 'vue';
import { useRouter } from '#vue-router';

interface SelectedItem {
  label: string;
  uuid: string;
  routineDescription: string;
  progress: number;
  started: string;
  ended: string;
  status: string;
  routineId?: string;
  serverId: string;
  previousRoutineExecution?: string;
  serverName: string;
  previousRoutineName: string;
  contract_id: string;
  layer_index: number;
}

interface SelectedTask {
  label: string;
  name: string;
  description: string;
  uuid: string;
  progress: number;
  started: string;
  ended: string;
  errored: boolean;
  previousTaskExecutionId?: string;
  previous_task_name: string;
  taskId?: string;
  serverId: string;
  serverName: string;
  failed: boolean;
  layer_index: number;
}

const layout = 'dashboard-layout';
const selectedItem = ref<SelectedItem | null>(null);
const route = useRoute();
const selectedTask = ref<SelectedTask | null>(null);
const dialogVisible = ref(false);
const selectedOption = ref('routineMap')
const routineMap = computedAsync(async () => {
  if (selectedItem.value) {
    const tasks = await $fetch(`/api/tasksInRoutines?routineId=${selectedItem.value.uuid}`);
    return tasks?.map((task: any) => {
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
        progress: (task.progress * 100).toFixed(0),
        scheduled: task.scheduled,
        started: task.started,
        ended: task.ended,
        previousTaskExecutionId: task.previous_task_execution_id,
        previous_task_name: task.previous_task_name,
        name: task.name,
        description: task?.description,
        serverName: task?.processing_graph,
        isUnique: task.is_unique,
        serverId: task.server_id,
        inputContext: task.input_context,
        outputContext: task.output_context,
        layer_index: task.layer_index,
      };
    }) || [];
  }
  return [];
}, []);

const { data: Items, error } = await useFetch<SelectedItem[]>('/api/activeRoutines');
const router = useRouter();

function onTaskSelected(task: SelectedTask) {
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

function getDuration(start: string, end: string | undefined) {
  const startTime = new Date(start);
  let endTime: Date;
  if (!end) {
    endTime = new Date(Date.now());
  } else {
    endTime = new Date(end);
  }
  const duration = +endTime - +startTime;
  return duration / 1000;
}

const navigateToItem = ( route: string ) => {
  router.push(route);
};
onMounted(() => {
  const appStore = useAppStore();
  appStore.setCurrentSection('serverActivity');

  const itemId = route.params.id as string;
  selectedItem.value = Items.value?.find((item: SelectedItem) => item.uuid === itemId) || null;
});

</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
