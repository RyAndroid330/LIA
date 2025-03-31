<template>
  <div class="routine-map-container q-mb-md">
    <!-- Reset Button -->
    <q-btn
      class="reset-btn"
      icon="refresh"
      round
      dense
      @click="resetView"
    />

    <VueFlow
      ref="vueFlowInstance"
      :nodes="nodes"
      :edges="edges"
      @node-click="onNodeClick"
      :max-zoom="1.5"
      fit-view-on-init
      width="80dvw"
      contenteditable="false"
      :nodes-draggable="false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import type { Node, Edge, Position, VueFlowInstance } from '@vue-flow/core';
import { VueFlow } from '@vue-flow/core';
import dagre from 'dagre';

const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);
const allNodes = ref<Node[]>([]);
const allEdges = ref<Edge[]>([]);
const vueFlowInstance = ref<VueFlowInstance | null>(null);

const emit = defineEmits<{
  (e: 'nodeSelected', task: Task): void;
}>();

interface Task {
  uuid: string;
  previousTaskExecutionId?: string;
  errored?: boolean;
}

const props = defineProps<{
  routineMap: Task[];
}>();

//  Graph Layout Function
function layoutGraph(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'LR', ranksep: 100, nodesep: 20 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 100, height: 50 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const nodeWithPos = g.node(node.id);
    return { ...node, position: { x: nodeWithPos.x, y: nodeWithPos.y } };
  });
}

//  Watch for Routine Changes
watch(props, async (newValue) => {
  if (!newValue.routineMap?.length) return;

  const routineMap = newValue.routineMap;
  nodes.value = [];
  edges.value = [];

  routineMap.forEach((task) => {
    nodes.value.push({
      id: task.uuid.toString(),
      position: { x: 0, y: 0 },
      sourcePosition: 'right' as Position,
      targetPosition: 'left' as Position,
      data: { ...task },
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

  // Store full graph for reset functionality
  allNodes.value = [...nodes.value];
  allEdges.value = [...edges.value];

  await nextTick();
  fitView();
});

//  Node Click: Filter Connected Nodes & Emit Task
function onNodeClick({ node }: { node: Node }) {
  const connectedNodes = new Set<string>();
  const queue = [node.id];
  resetView();
  // Forward Traversal (Find connected child nodes)
  while (queue.length) {
    const currentId = queue.shift()!;
    connectedNodes.add(currentId);

    edges.value.forEach((edge) => {
      if (edge.source === currentId && !connectedNodes.has(edge.target)) {
        queue.push(edge.target);
      }
    });
  }

  // Backward Traversal (Find connected parent nodes)
  queue.push(node.id);
  while (queue.length) {
    const currentId = queue.shift()!;
    connectedNodes.add(currentId);

    edges.value.forEach((edge) => {
      if (edge.target === currentId && !connectedNodes.has(edge.source)) {
        queue.push(edge.source);
      }
    });
  }

  nodes.value = layoutGraph(
    allNodes.value.filter((node) => connectedNodes.has(node.id)),
    allEdges.value.filter(
      (edge) => connectedNodes.has(edge.source) && connectedNodes.has(edge.target)
    )
  );

  edges.value = allEdges.value.filter(
    (edge) => connectedNodes.has(edge.source) && connectedNodes.has(edge.target)
  );

  // Emit task when clicking a node
  const task = node.data as Task;
  emit('nodeSelected', task);

  fitView();
  setTimeout(() => {
    fitView();
  }, 50);
}

//  Fit View Function
function fitView() {
  if (vueFlowInstance.value) {
    vueFlowInstance.value.fitView();
  }
}

//  Reset Function (Restores Layout & Zoom)
function resetView() {
  nodes.value = layoutGraph([...allNodes.value], [...allEdges.value]);
  edges.value = [...allEdges.value];
  nextTick(() => fitView());
  setTimeout(() => {
    fitView();
  }, 50);
}
</script>

<style>
.routine-map-container {
  position: relative;
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

.reset-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background: #7abfd2;
  border-radius: 50%;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
  color: black;
}
@media (prefers-color-scheme: dark) {
  .reset-btn {
    background: #7abfd2;
    color: rgb(255, 255, 255);
    border-color:#7abfd2;
  }
}
</style>
