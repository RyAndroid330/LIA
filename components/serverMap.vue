<template>
    <div class="map-container">
      <VueFlow :nodes="nodes" :edges="edges" @node-click="onNodeClick" :max-zoom="1.5" fit-view-on-init width="90dvw" contenteditable="false" :nodes-draggable="false" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Node, Edge, Position } from '@vue-flow/core';
import { VueFlow } from '@vue-flow/core';
import dagre from 'dagre';

const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);

// Function to apply dagre layout with increased spacing
function layoutGraph(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'LR',  // TB = top to bottom
    ranksep: 500,   // Increase vertical space between layers
    nodesep: 10,   // Increase horizontal space between nodes
    edgesep: 1,   // Increase horizontal space between edges
    align: 'DL', //
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
  const serverMap = await $fetch('/api/serverMap');

  if (serverMap && serverMap.length > 0) {
    // Create nodes
    serverMap.forEach((server, index) => {
      nodes.value.push({
        id: server.server_id.toString(),
        position: { x: 0, y: 0 },
        sourcePosition: 'right' as Position,
        targetPosition: 'left' as Position,
        data: { label: server.processing_graph },
        type: undefined,
        class: 'custom-node'
      });
    });

    // Create edges based on client_id
    serverMap.forEach((server) => {
      if (server.client_id) {
        edges.value.push({
          id: `e${server.server_id}-${server.client_id}`,
          source: server.client_id.toString(),
          target: server.server_id.toString(),
          animated: false
        });
      }
    });

    // Apply dagre layout
    nodes.value = layoutGraph(nodes.value, edges.value);
  }
});

// Add click event handler
const emit = defineEmits(['nodeSelected']);
function onNodeClick({ event, node }: { event: any, node: Node }) {
  console.log(node.data);
  emit('nodeSelected', node.id);
  console.log(node.id);
}
</script>

<style>
.map-container {
  width: 80%;
  height: 100dvh;
  //border: 1.5px solid lightgray;
  //border-radius: 10px;
}

.custom-node {
  background: #7abfd2;
  color: white;
  border-radius: 4px;
  padding: 5px;
  width: 100px;
}
</style>
