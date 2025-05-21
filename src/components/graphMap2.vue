<!-- <template>
  <div>
    <graph-map />
  </div>
</template>

<script>
import { onMounted, watch } from 'vue';
import { useFetch } from 'vue';
import { ref } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

export default {
  components: { GraphMap },
  setup() {
    const nodes = ref([]);
    const edges = ref([]);

    const fetchTasks = async () => {
      const { data: tasks } = await useFetch('/api/tasks');

      if (tasks.value && tasks.value.length > 0) {
        const startX = 50;
        const startY = 50;

        // Clear nodes and edges before populating
        nodes.value = [];
        edges.value = [];

        // Create nodes only for tasks that match the prop.item.uuid
        tasks.value.forEach((task, index) => {
          if (task.graph === props.item.label) {
            const x = startX + 100 * index;
            const y = startY + 100 * index;

            // Add the node to nodes array
            nodes.value.push({
              id: task.uuid.toString(),
              position: { x, y },
              data: { label: `Task: ${task.uuid.slice(-6)}` },
              class: 'custom-node'
            });
          }
        });

        // Create edges based on uuid
        tasks.value.forEach((task) => {
          if (task.graph === props.item.label) {
            edges.value.push({
              id: `e${task.uuid}-${task.uuid}`,
              source: task.uuid.toString(),
              target: task.uuid.toString(),
              animated: false
            });
          }
        });
      }
    };

    // Watch for changes in the selected graph
    watch(() => props.item, (newValue, oldValue) => {
      if (newValue !== oldValue) {
        fetchTasks();
      }
    }, { immediate: true });

    return {
      nodes,
      edges
    };
  },
};
</script> -->

<template>
  <div>
    <p>{{ data }}</p>
  </div>
</template>

<script setup>
const { data: tasks } = await useFetch('/api/tasks');
</script>
