<template>
  <div>
    <VueApexCharts type="rangeBar" height='300%' width='85%' :options="chartOptions" :series="series" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

const props = defineProps({
  routineMap: {
    type: Object,
    required: true
  }
});

const chartOptions = ref({
  chart: {
    zoom: {
      enabled: false
    },
  },
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: '80%',
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
    opacity: 0.6
  },
  legend: {
    position: 'right'
  },
});

const series = computed(() => {
  if (!props.routineMap || Object.keys(props.routineMap).length === 0) {
    return [];
  }

  const sortedTasks = Object.values(props.routineMap)
    .sort((a, b) => a.layer_index - b.layer_index || new Date(a.scheduled) - new Date(b.scheduled));

  const seriesData = sortedTasks.map(task => {
    const scheduledTime = new Date(task.scheduled).getTime();
    const startedTime = new Date(task.started).getTime();
    const endedTime = new Date(task.ended).getTime();

    const data = [];

    if (scheduledTime && startedTime) {
      data.push({
        x: `${task.layer_index}`,
        y: [scheduledTime, startedTime],
        label: 'Scheduled to Started'
      });
    }

    if (startedTime && endedTime) {
      data.push({
        x: `${task.layer_index}`,
        y: [startedTime, endedTime]
      });
    }

    return {
      name: task.label,
      data
    };
  }).filter(task => task.data.length > 0);

  return seriesData;
});
</script>
