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
import { ref, onMounted } from 'vue';
import type { Node, Edge } from '@vue-flow/core';
import { VueFlow } from '@vue-flow/core';
import dagre from 'dagre';

const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);

// Function to apply dagre layout with increased spacing
function layoutGraph(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'TB',  // TB = top to bottom
    ranksep: 100,   // Increase vertical space between layers
    nodesep: 150,   // Increase horizontal space between nodes
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

onMounted(async () => {
  const serverMap = await $fetch('/api/serverMap');

  if (serverMap && serverMap.length > 0) {
    // Create nodes
    serverMap.forEach((server, index) => {
      nodes.value.push({
        id: server.server_id.toString(),
        position: { x: 0, y: 0 },
        data: { label: server.server_id.slice(-6) },
        type: index === 0 ? 'input' : (index === serverMap.length - 1 ? 'output' : undefined),
        class: 'custom-node'
      });
    });

    // Create edges based on client_id
    serverMap.forEach((server) => {
      if (server.client_id) {
        edges.value.push({
          id: `e${server.server_id}-${server.client_id}`,
          source: server.server_id.toString(),
          target: server.client_id.toString(),
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
