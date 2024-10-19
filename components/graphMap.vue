<template>
  <q-card class="custom-card col flex-center q-ma-md"
    elevated
    style='max-width: 60dvw; max-height: 80dvh; overflow-y: auto'>
    <div class="map-container">
      <VueFlow :nodes="nodes" :edges="edges" @node-click="onNodeClick" />
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Node, Edge } from '@vue-flow/core';
import { VueFlow } from '@vue-flow/core';

const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

// Function to create nodes and edges
const createGraph = async () => {
  const { data: tasks } = await useFetch('/api/tasks');
  const { data: tasksInGraphs } = await useFetch('/api/tasksInGraphs');

  if (tasks.value && tasks.value.length > 0) {
    // Clear existing nodes and edges
    nodes.value = [];
    edges.value = [];

    const filteredTasks = tasks.value.filter(task => task.graph === props.item.uuid);
    const startX = 50;
    const startY = 50;

    // Create nodes for filtered tasks
    filteredTasks.forEach((task, index) => {
      const x = startX + 100 * index;
      const y = startY + 100 * index;

      nodes.value.push({
        id: task.uuid.toString(),
        position: { x, y },
        data: { label: `Task: ${task.uuid.slice(-6)}` },
        class: 'custom-node'
      });
    });

    // Generate edges from tasksInGraphs
    if (tasksInGraphs.value && tasksInGraphs.value.length > 0) {
      tasksInGraphs.value.forEach((graphEdge) => {
        // Find the corresponding task node ids for task_id and predecessor_task_id
        const source = graphEdge.predecessor_task_id;
        const target = graphEdge.task_id;

        edges.value.push({
          id: `e${source}-${target}`,
          source: source.toString(),
          target: target.toString(),
          animated: false
        });
      });
    }
  }
};

// Watch for changes in props.item and recreate the graph
watch(() => props.item, async (newItem) => {
  if (newItem) {
    await createGraph();
  }
}, { immediate: true });

// Add click event handler
const emit = defineEmits(['nodeSelected']);
function onNodeClick({ event, node }: { event: any, node: Node }) {
  console.log(node.data);
  emit('nodeSelected', node.id);
  console.log(node.id);
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 400px;
}

.custom-node {
  background: rgb(122, 175, 245);
  color: white;
  border: 1px solid rgb(241, 211, 78);
  border-radius: 4px;
  box-shadow: 0 0 0 1px rgb(0, 0, 0);
  padding: 8px;
  width: 50px;
}
</style>
