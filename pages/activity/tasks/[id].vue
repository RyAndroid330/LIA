<template>
  <NuxtLayout :name="layout">
    <template #title>
      {{ taskExecution?.name }} - {{ taskExecution?.uuid?.slice(0, 8) }}
    </template>

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
            <div v-if="taskExecution.previousTaskExecutionId[0]" class="q-mx-md q-my-sm cursor-pointer text-warning">
              <div v-for="(id, index) in taskExecution.previousTaskExecutionId" :key="index" @click="navigateToItem(`/activity/tasks/${id}`)">
                Previous Task {{ index + 1 }}: {{ id }}
              </div>
            </div>
            <div v-if="taskExecution.nextTaskExecutionId[0]" class="q-mx-md q-my-sm cursor-pointer text-warning">
              <div v-for="(id, index) in taskExecution.nextTaskExecutionId" :key="index" @click="navigateToItem(`/activity/tasks/${id}`)">
                Next Task {{ index + 1 }}: {{ id }}
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
        nextTaskExecutionId: task.next_task_execution_ids,
        serverId: task.server_id,
        routineName: task.routine_name,
        serverName: task.processing_graph,
        previous_task_name: task.previous_task_name,
        function_string: task.function_string,
      };
    }
  } catch (error) {
    console.error('Error fetching task execution:', error);
  }
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
</script>
