<template>
  <div class="routine-map-container q-mb-md" style="width: 80%; height: 600px">
    <VueFlow :nodes="nodes" :edges="edges" @node-click="onNodeClick" :max-zoom="1.5" fit-view-on-init width="80dvw" contenteditable="false" :nodes-draggable="false" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Node, Edge, Position } from '@vue-flow/core';
import { VueFlow } from '@vue-flow/core';
import { useFetch } from '#app';
import dagre from 'dagre';

const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);

interface Task {
  uuid: string;
  previousTaskExecutionId?: string;
  errored?: boolean;
}

const props = defineProps<{
  routineMap: Task[];
}>();

function layoutGraph(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'LR',
    ranksep: 100,
    nodesep: 20,
  });
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to the dagre graph
  nodes.forEach((node) => {
    g.setNode(node.id, { width: node.width || 50, height: node.height || 50 });
  });

  // Add edges to the dagre graph
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  // Update node positions
  return nodes.map((node) => {
    const nodeWithPos = g.node(node.id);
    return {
      ...node,
      position: { x: nodeWithPos.x, y: nodeWithPos.y },
    };
  });
}

watch(props, (newValue) => {
  if (!newValue.routineMap?.length) {
    return;
  }
  const routineMap = newValue.routineMap;
  nodes.value = [];
  edges.value = [];

  if (routineMap && routineMap.length) {
    routineMap.forEach((task) => {
      nodes.value.push({
        id: task.uuid.toString(),
        position: { x: 0, y: 0 },
        sourcePosition: 'right' as Position,
        targetPosition: 'left' as Position,
        data: {
          ...task,
        },
        type: undefined,
        class: task.errored ? 'custom-node error-node' : 'custom-node',
      });
    });

    routineMap.forEach((task) => {
      if (task.previousTaskExecutionId) {
        edges.value.push({
          id: `e${task.uuid}-${task.previousTaskExecutionId}`,
          source: task.previousTaskExecutionId.toString(),
          target: task.uuid.toString(),
          animated: false
        });
      }
    });

    nodes.value = layoutGraph(nodes.value, edges.value);
  }
});

const emit = defineEmits<{
  (e: 'nodeSelected', task: Task): void;
}>();

function onNodeClick({ event, node }: { event: any, node: Node }) {
  const task = node.data as Task;
  emit('nodeSelected', task);
}
</script>

<style>
.routine-map-container {
  width: 80dvw;
  height: 50dvh;
}

.custom-node {
  background: #7abfd2;
  color: white;
  border-radius: 4px;
  padding: 5px;
  width: 100px;
}
.error-node {
  background: #d37b7b !important;
}
</style>
