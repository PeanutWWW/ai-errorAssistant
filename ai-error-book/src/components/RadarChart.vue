<script setup>
import { ref, onMounted, watch } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { RadarChart as ERadarChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'

use([CanvasRenderer, ERadarChart, TooltipComponent])

const props = defineProps({
  data: {
    type: Array,
    default: () => [
      { subject: '函数', score: 75 },
      { subject: '几何', score: 60 },
      { subject: '概率', score: 85 },
      { subject: '代数', score: 70 },
      { subject: '数列', score: 55 },
      { subject: '三角函数', score: 80 }
    ]
  }
})

const option = ref({})

const updateChart = () => {
  const indicators = props.data.map(d => ({ name: d.subject, max: 100 }))
  const values = props.data.map(d => d.score)

  option.value = {
    color: ['#1e6fdb'],
    tooltip: {
      trigger: 'item'
    },
    radar: {
      indicator: indicators,
      shape: 'polygon',
      radius: '65%',
      center: ['50%', '50%'],
      axisName: {
        color: '#4b5563',
        fontSize: 13,
        fontWeight: 500
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(30, 111, 219, 0.02)', 'rgba(30, 111, 219, 0.05)', 'rgba(30, 111, 219, 0.08)', 'rgba(30, 111, 219, 0.11)', 'rgba(30, 111, 219, 0.14)']
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(30, 111, 219, 0.15)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(30, 111, 219, 0.15)'
        }
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: values,
        name: '掌握度',
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 2,
          color: '#1e6fdb'
        },
        areaStyle: {
          color: 'rgba(30, 111, 219, 0.2)'
        },
        itemStyle: {
          color: '#1e6fdb',
          borderColor: '#fff',
          borderWidth: 2
        }
      }],
      animationDuration: 1500,
      animationEasing: 'cubicOut'
    }]
  }
}

onMounted(updateChart)
watch(() => props.data, updateChart, { deep: true })
</script>

<template>
  <div class="radar-chart">
    <v-chart class="chart" :option="option" autoresize />
  </div>
</template>

<style scoped>
.radar-chart {
  width: 100%;
  height: 320px;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>
