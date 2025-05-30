<template>
 <NuxtLayout name="dashboard-layout">
  <NuxtLayout name="dashboard-main-layout">
    <template #title>
      {{ taskExecution?.name }} - {{ taskExecution?.uuid?.slice(0, 8) }}
      <q-btn color="warning"  @click="showGenerateDialog = true">Generate Contract
        <q-tooltip anchor="top middle" self="bottom middle">
          Generate a contract from this point
        </q-tooltip>
      </q-btn>
    </template>
    <div>
      <activeTaskMap :taskMap="taskMap" />
    </div>

    <div class="row q-mx-md">
      <InfoCard v-if="taskExecution">
        <template #title>
          {{ taskExecution.name }}
        </template>
        <template #info>
          <div class="flex-column full-width">

            <div class="q-mx-md q-my-sm">
              Description: {{ taskExecution.description }}
            </div>
            <div class="q-mx-md q-my-sm">
              Execution ID: {{ taskExecution.uuid }}
            </div>
            <div class="q-mx-md q-my-sm">
              Routine Name: {{ taskExecution.routineName }}
            </div>
            <div class="q-separator" style="height: 2px"></div>
            <div class="q-mx-md q-my-sm">
              Is Unique: {{ taskExecution.isUnique }}
            </div>
            <div class="q-separator" style="height: 2px"></div>
            <div class="flex">
              <div>
                <div class="q-mx-md q-my-sm">
                  Progress: {{ taskExecution.progress }}%
                </div>
                <div class="q-mx-md q-my-sm">
                  Started: {{ formatDate(taskExecution.started) }}
                </div>
                <div class="q-mx-md q-my-sm">
                  Ended: {{ formatDate(taskExecution.ended) }}
                </div>
                <div class="q-mx-md q-my-sm">
                  Duration: {{ getDuration(taskExecution.started, taskExecution.ended) }} sec
                </div>
              </div>
              <ProgressRadialBarChart v-if="taskExecution" :name="taskExecution?.name" :value="taskExecution?.progress" />
            </div>
            <div class="q-separator" style="height: 2px"></div>
            <div class="q-mx-md q-my-sm">
              Success: {{ !taskExecution.failed && !taskExecution.errored }}
            </div>
            <div class="q-separator" style="height: 2px"></div>
            <div v-if="taskExecution.previousTaskExecutionId!==null" class="q-mx-md q-my-sm cursor-pointer text-warning">
              <div v-for="(id, index) in taskExecution.previousTaskExecutionId" :key="index" @click="navigateToItem(`/activity/tasks/${id}`)">
                Previous {{ taskExecution.previousTaskNames[index] }}
              </div>
            </div>
            <div v-if="taskExecution.nextTaskExecutionId!==null" class="q-mx-md q-my-sm cursor-pointer text-warning">
              <div v-for="(id, index) in taskExecution.nextTaskExecutionId" :key="index" @click="navigateToItem(`/activity/tasks/${id}`)">
                Next {{ taskExecution.nextTaskNames[index] }}
              </div>
            </div>
            <div class="q-mx-md q-my-sm cursor-pointer text-warning" @click="navigateToItem(`/activity/routines/${taskExecution.routineExecutionId}`)">
              Routine Execution ID: {{ taskExecution.routineName }}
            </div>

            <div v-if="taskExecution.taskId" class="q-mx-md q-my-sm cursor-pointer text-primary" @click="navigateToItem(`/assets/tasks/${taskExecution.taskId}`)">
              Task: {{ taskExecution.name }}
            </div>

            <div class="q-mx-md q-my-sm cursor-pointer text-primary" @click="navigateToItem(`/assets/${taskExecution.serverName}`)">
              Server: {{ taskExecution.serverName }}
            </div>
            <div class="q-mx-md q-my-sm" @click="navigateToItem( `/contracts/${ taskExecution?.contract_id }` )">
              <span class="text-secondary cursor-pointer">Contract</span>
            </div>
          </div>
        </template>
      </InfoCard>

      <div>
        <InfoCard>
          <template #title>Input Context</template>
          <template #info>
            <div class="q-mx-md q-my-sm">
              <pre>{{ taskExecution?.inputContext }}</pre>
            </div>
          </template>
        </InfoCard>

        <InfoCard>
          <template #title>Tasks Function</template>
          <template #info>
            <div class="q-mx-md q-my-sm">
              <pre>{{ taskExecution?.function_string }}</pre>
            </div>
          </template>
        </InfoCard>

        <InfoCard>
          <template #title>Output Context</template>
          <template #info>
            <div class="q-mx-md q-my-sm">
              <pre>{{ taskExecution?.outputContext }}</pre>
            </div>
          </template>
        </InfoCard>
      </div>
    </div>
    <q-dialog v-model="showGenerateDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirm Generate</div>
          <div>Are you sure you want to generate a contract?</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="showGenerateDialog = false" />
          <q-btn flat label="Confirm" color="secondary" @click="confirmGenerate" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </NuxtLayout>
 </NuxtLayout>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from '#app';
import { ref, onMounted } from 'vue';
import { useRouter } from '#vue-router';
import { useAppStore } from '@/stores/app';

const layout = 'dashboard-layout';
const route = useRoute();
const router = useRouter();
const taskExecutionId = ref<string>('');
const taskExecution = ref<any>(null);

async function fetchTaskExecution() {
  if (!taskExecutionId.value) return;

  try {
    const result = await $fetch(`/api/taskExecution?id=${taskExecutionId.value}`);
    if (result?.length) {
      const task = result[0];
      taskExecution.value = {
        uuid: task.uuid,
        routineExecutionId: task.routine_execution_id,
        taskId: task.task_id,
        isRunning: task.is_running,
        isComplete: task.is_complete,
        errored: task.errored,
        failed: task.failed,
        progress: (task.progress * 100).toFixed(0),
        scheduled: task.scheduled,
        started: task.started,
        ended: task.ended,
        inputContext: task.input_context,
        outputContext: task.output_context,
        inputContextId: task.context_id,
        outputContextId: task.result_context_id,
        name: task.name,
        description: task.description,
        isUnique: task.is_unique,
        previousTaskExecutionId: task.previous_task_execution_ids,
        previousTaskNames: task.previous_task_names,
        nextTaskExecutionId: task.next_task_execution_ids,
        nextTaskNames: task.next_task_names,
        serverId: task.server_id,
        routineName: task.routine_name,
        serverName: task.processing_graph,
        previous_task_name: task.previous_task_name,
        function_string: task.function_string,
        contract_id: task.contract_id,
      };
    }
  } catch (error) {
    console.error('Error fetching task execution:', error);
  }
}

const Item = computed(() => taskExecution.value);


interface Item {
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
  inputContext: string;
  outputContext: string;
}

const taskMap = computedAsync(async () => {
  if (Item.value) {
    const tasks = await $fetch(`/api/tasksInRoutines?routineId=${taskExecution.value.routineExecutionId}`);
    const map = tasks?.map((task: any) => {
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
        routineExecutionId: task.routine_execution_id,
        splitGroupId: task.split_group,
      };
    }) || [];

    const splitGroupIndices = new Map<string, number>();
    let index = 0;
    map?.forEach(node => {
      if (splitGroupIndices.has(node.splitGroupId)) {
        node.splitGroupId = splitGroupIndices.get(node.splitGroupId);
      } else {
        splitGroupIndices.set(node.splitGroupId, index);
        node.splitGroupId = index;
        index++;
      }

      const taskNameCodeNumber = stringToUnitInterval(node.name);
      node.splitGroupId += taskNameCodeNumber;
    });

    return map.sort((a, b) => a.splitGroupId - b.splitGroupId);
  }
  return [];
}, []);

function fnv1aHash(str: string) {
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0; // FNV prime
  }
  return hash;
}

function stringToUnitInterval(str: string) {
  const hash = fnv1aHash(str);
  return hash / 0xFFFFFFFF;
}

function formatDate(date?: string) {
  if (!date) return 'Not finished';
  const datetime = new Date(date);
  return `${datetime.toDateString()} ${datetime.toLocaleTimeString()}`;
}

function getDuration(start?: string, end?: string) {
  if (!start) return 'N/A';
  const startTime = new Date(start).getTime();
  const endTime = end ? new Date(end).getTime() : Date.now();
  return ((endTime - startTime) / 1000).toFixed(2);
}

const navigateToItem = (path: string) => {
  console.log('Navigating to:', path);
  router.push(path);
};

onMounted(() => {
  const appStore = useAppStore();
  appStore.setCurrentSection('serverActivity');

  taskExecutionId.value = route.params.id as string;
  fetchTaskExecution();
});

const showStopDialog = ref(false);
const showGenerateDialog = ref(false);

function confirmStop() {
  showStopDialog.value = false;
  // Add logic to handle stopping the process
}

function confirmGenerate() {
  showGenerateDialog.value = false;
  // Add logic to handle generating the contract
}
</script>
