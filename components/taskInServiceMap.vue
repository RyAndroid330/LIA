<template>
  <div class="map-container q-ma-md">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      @node-click="onNodeClick"
      :max-zoom="1.5"
      fit-view-on-init
      :nodes-draggable="false"
    >
      <template #node-custom="props">
        <CustomNode :data="props.data" />
      </template>
    </VueFlow>
    <div v-if="loading" class="loading-overlay">Loading...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Node, Edge, Position } from '@vue-flow/core';
import { VueFlow } from '@vue-flow/core';
import dagre from 'dagre';
import { useRoute, useRouter } from '#app';
import CustomNode from '~/components/CustomNode.vue';

const route = useRoute();
const router = useRouter();

const props = defineProps({
  serviceName: {
    type: String,
    required: false,
  },
});

const emit = defineEmits(['nodeSelected']);

const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);
const loading = ref(false);

const DEFAULT_NODE_WIDTH = 100;
const DEFAULT_NODE_HEIGHT = 40;

function layoutGraph(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'LR',
    ranksep: 75,
    nodesep: 40,
    edgesep: 10,
    align: 'DL',
  });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    g.setNode(node.id, {
      width: node.width ?? DEFAULT_NODE_WIDTH,
      height: node.height ?? DEFAULT_NODE_HEIGHT,
    });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const nodeWithPos = g.node(node.id);
    return {
      ...node,
      position: { x: nodeWithPos.x, y: nodeWithPos.y },
    };
  });
}

async function loadGraph() {
  const serviceName = props.serviceName || route.params.id;
  if (!serviceName) return;

  loading.value = true;

  try {
    const serverMap = await $fetch(`/api/tasksInServices?serviceName=${serviceName}`);
    nodes.value = [];
    edges.value = [];

    if (serverMap && serverMap.length > 0) {
      nodes.value = serverMap
        .filter((server: any) => server.processing_graph === serviceName)
        .map((server: any) => ({
          id: server.uuid,
          position: { x: 0, y: 0 },
          sourcePosition: 'right',
          targetPosition: 'left',
          data: {
            label: server.name.toString(),
            uuid: server.uuid,
            description: server.description || 'No description',
            is_unique: server.is_unique || false,
            concurrency: server.concurrency || 1,
            isSelected: server.uuid === route.params.id,
          },
          type: 'custom',
        }));

      edges.value = serverMap
        .filter((server: any) => server.previous_task_execution_id)
        .map((server: any) => ({
          id: `e${server.uuid}-${server.previous_task_execution_id}`,
          source: server.previous_task_execution_id,
          target: server.uuid,
          animated: false,
        }));

      nodes.value = layoutGraph(nodes.value, edges.value);
    }
  } catch (error) {
    console.error('Failed to fetch graph data:', error);
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.serviceName || route.params.id,
  async () => {
    await loadGraph();
  },
  { immediate: true }
);

function onNodeClick({ event, node }: { event: any; node: Node }) {
  nodes.value = nodes.value.map((n) => ({
    ...n,
    data: { ...n.data, isSelected: n.id === node.id },
  }));

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

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2em;
}
</style>
