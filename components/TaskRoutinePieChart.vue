<template>
  <InfoCard>
    <template #title>
      Execution Statistics
    </template>
    <template #info>
      <div>
        <apexchart type="pie" :options="chartOptions" :series="series" width="600"></apexchart>
      </div>
    </template>
  </InfoCard>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts';

export default {
  components: {
    apexchart: VueApexCharts,
  },
  props: {
  type: String,
  taskId: String,
  routineId: String
},
  data() {
    return {
      series: [],
      chartOptions: {
        chart: {
          width: 380,
          type: 'pie',
        },
        labels: ['Successful', 'Errored', 'Failed', 'Reached Timeout'],
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom',
              fontSize: '16px' // Increase the font size for the legend
            }
          }
        }],
        legend: {
          fontSize: '22px' // Increase the font size for the legend
        }
      }
    };
  },
  async mounted() {
  let url;
  if (this.type === 'routine') {
    url = `/api/routineErrors?routineId=${this.routineId}`;
  } else {
    url = `/api/taskErrors?taskId=${this.taskId}`;
  }

  const { data } = await useFetch(url);
  const values = Object.values(data.value[0]);
  const isComplete = parseInt(values[0]);
  const errored = parseInt(values[1]);
  const failed = parseInt(values[2]);
  const reachedTimeout = parseInt(values[3]);

  this.series = [
    isComplete - (errored + failed + reachedTimeout),
    errored,
    failed,
    reachedTimeout,
  ];
  this.chartOptions.colors = ['#34C759', '#FF69B4', '#FFC107', '#8B9467'];
}
};
</script>
