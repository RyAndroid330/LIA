<template>
  <div class="routine-map-container q-mb-md">
    <VueFlow
      ref="vueFlowInstance"
      :nodes="nodes"
      :edges="edges"
      @node-click="onNodeClick"
      :max-zoom="1.5"
      fit-view-on-init
      contenteditable="false"
      :nodes-draggable="false"
    >
      <template #node-custom="props">
        <CustomNode :data="props.data" />
      </template>
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { VueFlow, type Node, type Edge, type Position, type VueFlowInstance } from '@vue-flow/core'
import dagre from 'dagre'
import { useRouter } from '#app'
import CustomNode from '~/components/CustomNode.vue'

const router = useRouter()

const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])
const allNodes = ref<Node[]>([])
const allEdges = ref<Edge[]>([])
const vueFlowInstance = ref<VueFlowInstance | null>(null)

const emit = defineEmits<{
  (e: 'nodeSelected', task: string): void;
}>()

interface Task {
  uuid: string;
  previousTaskExecutionId?: string;
  errored?: boolean;
  description?: string;
  is_unique?: boolean;
  concurrency?: number;
}

const props = defineProps<{
  routineMap: Task[];
}>()

// Dagre Layout Function
function layoutGraph(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'LR', ranksep: 100, nodesep: 40 })
  g.setDefaultEdgeLabel(() => ({}))

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 100, height: 50 })
  })

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  return nodes.map((node) => {
    const pos = g.node(node.id)
    return {
      ...node,
      position: { x: pos.x, y: pos.y },
      // 🔽 Ensure these are kept
      sourcePosition: node.sourcePosition,
      targetPosition: node.targetPosition
    }
  })
}


watch(props, async (newValue) => {
  if (!newValue.routineMap?.length) return

  const routineMap = newValue.routineMap
  nodes.value = []
  edges.value = []

  nodes.value = routineMap.map((task) => ({
  type: 'custom',
  id: task.uuid.toString(),
  position: { x: 0, y: 0 },
  data: {
    label: task.label,
    uuid: task.uuid,
    description: task.description,
    is_unique: task.is_unique,
    concurrency: task.concurrency,
    errored: task.errored,
    sourcePosition: 'right',
    targetPosition: 'left',
  },
  class: task.errored ? 'custom-node error-node' : 'custom-node',
}))

  routineMap.forEach((task) => {
    if (task.previousTaskExecutionId) {
      edges.value.push({
        id: `e${task.uuid}-${task.previousTaskExecutionId}`,
        source: task.previousTaskExecutionId,
        target: task.uuid,
        animated: false
      })
    }
  })

  nodes.value = layoutGraph(nodes.value, edges.value)

  allNodes.value = [...nodes.value]
  allEdges.value = [...edges.value]

  await nextTick()
  fitView()
})

function onNodeClick({ node }: { event: any, node: Node }) {
  emit('nodeSelected', node.id)
  router.push(`/assets/tasks/${node.id}`)
}

function fitView() {
  vueFlowInstance.value?.fitView()
}
</script>

<style>
.routine-map-container {
  position: relative;
  min-width: 55dvw;
  max-width: 80dvw;
  height: 50dvh;
  box-shadow: 0 1px 6px 0 rgba(105, 105, 105, 0.5);
  border-radius: 20px;
  margin: 10px;
}

.error-node {
  background: #d37b7b !important;
}
</style>
