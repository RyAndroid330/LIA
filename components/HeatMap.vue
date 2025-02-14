<template>
  <div id="chart">
    <div v-if="title === 'Year'" class="year-selector">
      <div class="header">
        <h4>{{ title }}</h4>
        <select id="year" v-model="selectedYear" @change="updateYear" style="margin-left: 10px; max-height: 30px;">
          <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>
    </div>
    <button v-if="title === 'Month'" @click="goBack">Back to Year</button>
    <apexchart type="heatmap" height="100%" width="100%" :options="chartOptions" :series="series"></apexchart>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

export default defineComponent({
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      title: 'Year' as string,
      selectedYear: new Date().getFullYear(),
      years: Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i),
      series: [] as any[],
      chartOptions: {
        chart: {
          height: 350,
          type: 'heatmap',
          events: {
            dataPointSelection: (event: any, chartContext: any, config: any) => {
              if (this.title === 'Year') {
                this.handleClick(config.seriesIndex);
              }
            }
          }
        },
        plotOptions: {
          heatmap: {
            shadeIntensity: 0.5,
            radius: 0,
            useFillColorAsStroke: true,
            colorScale: {
              ranges: [
                {
                  from: 0,
                  to: 0,
                  name: 'no data',
                  color: '#FFFFFF'
                },
                {
                  from: 1,
                  to: 3,
                  name: 'low',
                  color: '#00A100'
                },
                {
                  from: 4,
                  to: 6,
                  name: 'medium',
                  color: '#128FD9'
                },
                {
                  from: 7,
                  to: 10,
                  name: 'high',
                  color: '#FFB200'
                },
                {
                  from: 11,
                  to: Infinity,
                  name: 'extreme',
                  color: '#FF0000'
                }
              ]
            }
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function(val: any, opts: any) {
            const errors = opts.w.globals.initialSeries[opts.seriesIndex].data[opts.dataPointIndex].errors;
            return errors > 0 ? '!' : '';
          },
          style: {
            colors: ['#000']
          }
        },
        stroke: {
          width: 1
        },
        tooltip: {
          custom: function({ series, seriesIndex, dataPointIndex, w }: { series: any[], seriesIndex: number, dataPointIndex: number, w: any }) {
            const dataPoint = series[seriesIndex][dataPointIndex];
            const errors = w.globals.initialSeries[seriesIndex].data[dataPointIndex].errors;
            const customElement = document.createElement('div');
            customElement.style.padding = '10px';
            customElement.innerHTML = `Executions: ${dataPoint}<br>`;
            if (errors > 0) {
              customElement.innerHTML += `<span style="color: red;">Errors: ${errors}</span>`;
            }
            return customElement;
          }
        }
      }
    };
  },
  async mounted() {
    await this.updateYear();
  },
  methods: {
    async fetchcontractExecutions() {
      const response = await fetch(`/api/AllMapping`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data;
    },
    async generateYearData() {
      const data = await this.fetchcontractExecutions();
      const yearData = Array.from({ length: 12 }, (_, month) => ({
        name: new Date(0, month).toLocaleString('default', { month: 'short' }),
        data: Array.from({ length: 31 }, (_, day) => {
          const date = new Date(this.selectedYear, month, day + 1);
          const executionsForDay = data.filter((contract: any) => new Date(contract.date).toDateString() === date.toDateString());
          const totalExecutions = executionsForDay.reduce((sum: number, contract: any) => sum + Number(contract.executions), 0);
          const totalErrors = executionsForDay.reduce((sum: number, contract: any) => sum + Number(contract.errors), 0);
          return { x: (day).toString(), y: totalExecutions, errors: totalErrors };
        })
      }));
      return yearData;
    },
    async generateMonthData(monthIndex: number) {
      const data = await this.fetchcontractExecutions();
      const monthData = Array.from({ length: 24 }, (_, hour) => ({
        name: `${hour.toString().padStart(2, '0')}:00`, // Formatting hour to "HH:00"
        data: Array.from({ length: 31 }, (_, day) => {
          const date = new Date(this.selectedYear, monthIndex, day + 1, hour);
          const contract = data.find((contract: any) => new Date(contract.date).toDateString() === date.toDateString() && parseInt(contract.hour) === hour);
          return { x: (day).toString(), y: contract ? contract.executions : 0, errors: contract ? contract.errors : 0 }; // No adjustment needed
        })
      }));
      return monthData;
    },
    async handleClick(monthIndex: number) {
      this.title = 'Month';
      this.series = await this.generateMonthData(monthIndex);
    },
    async updateYear() {
      this.series = await this.generateYearData();
    },
    goBack() {
      this.title = 'Year';
      this.updateYear();
    }
  }
});
</script>

<style scoped>
#chart {
  width:70dvw;
  height: 50dvh;
  margin: 35px auto;
}
.year-selector {
  text-align: center;
  margin-bottom: 20px;
}
button {
  display: block;
  margin: 20px auto;
  padding: 5px 10px;
  font-size: 10px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.header h4 {
  margin: 0;
}

.header select {
  margin-left: 1rem;
}
</style>
