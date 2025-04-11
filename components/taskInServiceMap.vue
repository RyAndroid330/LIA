<template>
  <div class="map-container q-ma-md">
    <VueFlow
    :nodes="nodes"
    :edges="edges"
    @node-click="onNodeClick"
    :max-zoom="1.5"
    fit-view-on-init
    contenteditable="false"
    :nodes-draggable="false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue';
import type { Node, Edge, Position } from '@vue-flow/core';
import { VueFlow } from '@vue-flow/core';
import dagre from 'dagre';
import { useRoute, useRouter } from '#app';

const route = useRoute();
const router = useRouter();

const props = defineProps({
  serviceName: {
    type: String,
    required: false,
  },
});

const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);

// Function to apply dagre layout with increased spacing
function layoutGraph(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'LR',
    ranksep: 200,
    nodesep: 50,
    edgesep: 10,
    align: 'DL',
  });
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to the dagre graph
  nodes.forEach((node) => {
    g.setNode(node.id, { width: node.width || 5, height: node.height || 30 });
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

onMounted(async () => {
  await loadGraph();
});

watchEffect(async () => {
  await loadGraph();
});

async function loadGraph() {
  const serviceName = props.serviceName || route.params.id;
  if (!serviceName) return;

  const serverMap = await $fetch(`/api/tasksInServices?serviceName=${serviceName}`);
  console.log(serverMap);
  if (serverMap && serverMap.length > 0) {
    nodes.value = [];
    edges.value = [];

    // Create nodes
    serverMap.forEach((server: any) => {
      if (server.processing_graph === serviceName) {
        nodes.value.push({
          id: server.uuid,
          position: { x: 0, y: 0 },
          sourcePosition: 'right' as Position,
          targetPosition: 'left' as Position,
          data: { label: server.name },
          type: undefined,
          class: route.params.id === server.uuid ? 'selected-node' : 'custom-node',
        });
      }
    });

    // Create edges based on previous_task_execution_id
    serverMap.forEach((server: any) => {
      if (server.previous_task_execution_id) {
        edges.value.push({
          id: `e${server.uuid}-${server.previous_task_execution_id}`,
          source: server.previous_task_execution_id,
          target: server.uuid,
          animated: false
        });
      }
    });

    // Apply dagre layout
    nodes.value = layoutGraph(nodes.value, edges.value);
  }
}

// Add click event handler
const emit = defineEmits(['nodeSelected']);
function onNodeClick({ event, node }: { event: any, node: Node }) {
  emit('nodeSelected', node.id);
  router.push(`/assets/tasks/${node.id}`);
}
</script>

<style>
.map-container {
  position: relative;
  min-width: 55dvw;
  max-width: 80dvw;
  height: 50dvh;
  box-shadow: 0 1px 6px 0 rgba(105, 105, 105, 0.5);
  border-radius: 20px;
  margin: 10px;
}
.selected-node {
  background: #f5b041 !important;
  box-shadow: 6px 6px #3332313b !important;
}
.custom-node {
  background: #7abfd2;
  color: white;
  border-radius: 4px;
  padding: 5px;
  width: 100px;
}
</style>
