<template>
  <InfoCard class="custom-card">
    <template #title>
      Execution Frequency
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
    apexchart: VueApexCharts
  },
  props: {
    values: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      chartOptions: {
        chart: {
          type: 'pie',
          height: 350
        },
        labels: [],
        colors: [],
        legend: {
          show: false
        },
        dataLabels: {
          enabled: true,
          formatter: function (val, opts) {
            return opts.w.globals.labels[opts.seriesIndex];
          },
          background: {
            enabled: true,
            foreColor: '#fff',
            padding: 4,
            opacity: 0.7,
            borderColor: '#fff'
          },
          style: {
            colors: ['rgb(200,200,200)'],
            fontSize: '14px',
          }
        }
      },
      series: []
    };
  },
  watch: {
    values: {
      immediate: true,
      handler(newValues) {
        if (newValues && newValues.length) {
          this.updateChart(newValues);
        } else {
          this.resetChart();
        }
      }
    }
  },
  methods: {
    updateChart(values) {
      const groupedData = values.reduce((acc, value) => {
        const service = value.processingGraph || '';
        const name = value.name || 'Unnamed';
        const key = `${service} ${name}`;
        if (!acc[key]) {
          acc[key] = { service, name, count: 0 };
        }
        acc[key].count++;
        return acc;
      }, {});

      const sortedData = Object.values(groupedData).sort((a, b) => a.service.localeCompare(b.service));
      const labels = [];
      const series = [];
      const colors = [];
      const predefinedColors = [
        '#f5b041', '#1abc9c', '#3498db', '#e74cff', '#5ff5f6', '#2ecc71', '#e67e22', '#34495e', '#16a085'
      ];
      let colorIndex = 0;
      const colorMap = {};

      sortedData.forEach((item) => {
        labels.push(`${item.service}  ${item.name}`);
        series.push(item.count);

        const colorKey = item.service || `${item.name}-${colorIndex}`;
        if (!colorMap[colorKey]) {
          colorMap[colorKey] = predefinedColors[colorIndex % predefinedColors.length];
          colorIndex++;
        }
        colors.push(colorMap[colorKey]);
      });

      this.chartOptions.labels = labels;
      this.chartOptions.colors = colors;
      this.series = series;
    },
    resetChart() {
      this.chartOptions.labels = [];
      this.chartOptions.colors = [];
      this.series = [];
    }
  }
};
</script>

<style scoped>
.custom-card {
  border-radius: 20px !important;
  width: 25dvw !important;
  max-height: 60dvh !important;
}
</style>
