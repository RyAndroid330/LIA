<template>
  <div>
    <VueApexCharts
    type="rangeBar"
    height='300%'
    width='85%'
    :options="chartOptions"
    :series="series"
    @click="onTaskSelected" />
  </div>
</template>

<script setup>
import { ref, computed, defineEmits } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

const props = defineProps({
  routineMap: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['taskSelected']);

const chartOptions = ref({
  chart: {
    zoom: {
      enabled: false
    },
  },
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: '100%',
    }
  },
  xaxis: {
    type: 'datetime',
    format: 'YYYY-MM-DD HH:mm:ss',
  },
  stroke: {
    width: 1,
  },
  fill: {
    type: 'solid',
    opacity: 0.4
  },
  legend: {
    position: 'right',
  },
});

const series = computed(() => {
  if (!props.routineMap || Object.keys(props.routineMap).length === 0) {
    return [];
  }

  const sortedTasks = Object.values(props.routineMap)
    .sort((a, b) => a.layer_index - b.layer_index || new Date(a.scheduled) - new Date(b.scheduled));

  return sortedTasks.map(task => {
    const scheduledTime = new Date(task.scheduled).getTime();
    const startedTime = new Date(task.started).getTime();
    const endedTime = new Date(task.ended).getTime();

    const data = [];

    if (scheduledTime && startedTime) {
      data.push({
        x: `${task.layer_index}`,
        y: [scheduledTime, startedTime],
      });
    }

    if (startedTime && endedTime) {
      data.push({
        x: `${task.layer_index}`,
        y: [startedTime, endedTime]
      });
    }

    return {
      name: `${task.label} (${task.uuid.slice( 0, 8 ) })`,
      id: task.uuid,
      data
    };
  }).filter(task => task.data.length > 0);
});

function onTaskSelected(event, chartContext, config) {
  const taskIndex = config.seriesIndex;
  const sectionIndex = config.dataPointIndex;
  const task = Object.values(props.routineMap)[taskIndex];
  if (task) {
    emit('taskSelected', task);
  }
}
</script>
