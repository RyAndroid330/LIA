<template>
  <InfoCard>
    <template #title>
      Execution Times
    </template>
    <template #info>
      <div>
        <apexchart type="area" height="350" width="700" :options="chartOptions" :series="series" style="color: black;"></apexchart>
      </div>
    </template>
  </InfoCard>
</template>

<script>
import { colors } from 'quasar';
import VueApexCharts from 'vue3-apexcharts';

export default {
  components: {
    apexchart: VueApexCharts,
  },
  props: {
    type: {
      type: String,
      required: true,
    },
    taskId: {
      type: String,
      required: false,
    },
    routineId: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      series: [],
      chartOptions: {
        chart: {
          type: 'area',
          height: 350,
          width: '100%',
          stacked: true,
          events: {
            selection: function (chart, e) {
            },
          },
        },
        colors: ['#008FFB', '#00E396', '#CED4DC'],
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: 'straight',
        },
        fill: {
          type: 'gradient',
          gradient: {
            opacityFrom: 0.6,
            opacityTo: 0.8,
          },
        },
        legend: {
          position: 'top',
          horizontalAlign: 'left',
        },
        xaxis: {
          type: 'datetime',
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Execution Time (seconds)',
          },
          labels: {
            formatter: function (value) {
              return value.toFixed(2); // Format to 2 decimal places
            },
          },
        },
      },
    };
  },
  methods: {
    async fetchData() {
      const endpoint = this.type === 'task' ? `/api/taskExecutionTimes?taskId=${this.taskId}` : `/api/routineExecutionTimes?routineId=${this.routineId}`;

      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.length === 0) {
          return;
        }

        const seriesData = data.map(item => ({
          date: new Date(item.started).toISOString(), // Convert to ISO string
          fastest: parseFloat(item.fastest_time), // Convert to float
          average: parseFloat(item.average_time), // Convert to float
          slowest: parseFloat(item.slowest_time), // Convert to float
        }));

        this.series = [
          {
            name: 'Slowest',
            data: seriesData.map(item => [item.date, item.slowest]),
          },
          {
            name: 'Average',
            data: seriesData.map(item => [item.date, item.average]),
          },
          {
            name: 'Fastest',
            data: seriesData.map(item => [item.date, item.fastest]),
          },
        ];
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>
