<template>
  <div id="chart">
    <div v-if="title === 'Year'" class="year-selector">
      <div class="header">
        <h4>{{ title }}</h4>
        <select id="year" v-model="selectedYear" @change="updateYear" style="margin-left: 10px; max-height: 30px;">
          <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
        </select>
        <!-- <select id="dataType" v-model="selectedDataType" @change="updateYear" style="margin-left: 10px; max-height: 30px;">
          <option value="executions">Executions</option>
          <option value="errors">Errors</option>
        </select> -->
      </div>
    </div>
    <button v-if="title === 'Month'" @click="goBack">Back to Year</button>
    <apexchart type="heatmap" height="100%" width="100%" :options="chartOptions" :series="series"></apexchart>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

let color1 = '#00A100';
let color2 = '#128FD9';
let color3 = '#FFB200';
let color4 = '#FF0000';

export default defineComponent({
  components: {
    apexchart: VueApexCharts,
  },
  props: {
    contractId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      title: 'Year' as string,
      selectedYear: new Date().getFullYear(),
      selectedDataType: 'executions' as string,
      years: Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i),
      series: [] as any[],
      chartOptions: reactive({
        chart: {
          height: 350,
          type: 'heatmap',
          background: '#f0f0f0',
          events: {
            dataPointSelection: (event: any, chartContext: any, config: any) => {
              if (String(this.title) === 'Year') {
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
                  color: color1
                },
                {
                  from: 4,
                  to: 6,
                  name: 'medium',
                  color: color2
                },
                {
                  from: 7,
                  to: 10,
                  name: 'high',
                  color: color3
                },
                {
                  from: 11,
                  to: Infinity,
                  name: 'extreme',
                  color: color4
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
          custom: ({ series, seriesIndex, dataPointIndex, w }: { series: any[], seriesIndex: number, dataPointIndex: number, w: any }) => {
            const dataPoint = series[seriesIndex][dataPointIndex];
            const errors = w.globals.initialSeries[seriesIndex].data[dataPointIndex].errors;
            const customElement = document.createElement('div');
            customElement.style.padding = '10px';
            if (String(this.selectedDataType) === 'executions') {
              customElement.innerHTML = `Executions: ${dataPoint}<br>`;
            }
            if (errors > 0) {
              customElement.innerHTML += `<span style="color: red;">Errors: ${errors}</span>`;
            }
            return customElement;
          }
        }
      })
    };
  },
  async mounted() {
    await this.updateYear();
  },
  methods: {
    async fetchcontractExecutions() {
      const response = await fetch(`/api/contractMapping?contractId=${this.contractId}`);
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
          return { x: (day+1).toString(), y: this.selectedDataType === 'executions' ? totalExecutions : totalErrors, errors: totalErrors };
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
          return { x: (day+1).toString(), y: contract ? (this.selectedDataType === 'executions' ? contract.executions : contract.errors) : 0, errors: contract ? contract.errors : 0 };
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
      this.updateChartOptions();
    },
    goBack() {
      this.title = 'Year';
      this.updateYear();
    },
    updateChartOptions() {
      if (this.selectedDataType === 'errors') {
        color1 = "rgba(255, 0, 0, 0.5)";
        color2 = "rgba(255, 0, 0, 0.5)";
        color3 = "rgba(255, 0, 0, 0.5)";
        color4 = "rgba(255, 0, 0, 1)";
      } else {
        color1 = "#00A100";
        color2 = "#128FD9";
        color3 = "#FFB200";
        color4 = "#FF0000";
      }
      this.chartOptions.plotOptions.heatmap.colorScale.ranges = [
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
          color: color1
        },
        {
          from: 4,
          to: 6,
          name: 'medium',
          color: color2
        },
        {
          from: 7,
          to: 10,
          name: 'high',
          color: color3
        },
        {
          from: 11,
          to: Infinity,
          name: 'extreme',
          color: color4
        }
      ];
    }
  },
  watch: {
    selectedDataType() {
      this.updateYear();
    }
  }
});
</script>

<style scoped>
#chart {
  width: 70vw;
  height: 50vh;
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
