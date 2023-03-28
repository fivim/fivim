<template>
  <div class="process-bar" :style="`height:${height};z-index:${zIndex}`">
    <div class="inner" :style="`height:${height};width:${getWidth()};background-color: ${getColor()}`"></div>
  </div>
</template>

<script setup lang="ts" >
import { ProcessItemInfo } from '@/types'
import { round } from '@/utils/number'

const props = defineProps({
  percent: {
    type: Number,
    default: () => (0),
    require: true
  },
  height: {
    type: String,
    default: () => ('50px'),
    require: true
  },
  zIndex: {
    type: String,
    default: () => ('1'),
    require: true
  },
  color: {
    type: String,
    default: () => ('')
  },
  colorMap: {
    type: Array<ProcessItemInfo>,
    default: () => ({})
  }
})

const getWidth = () => {
  if (round(props.percent) === 100) {
    return '0'
  }

  const percent = props.percent
  return percent.toFixed(2) + '%'
}

const getColor = () => {
  if (props.color) {
    return props.color
  } else {
    const percent = props.percent
    let lastItem: ProcessItemInfo = {
      percent: 0,
      color: ''
    }
    for (const item of props.colorMap) {
      lastItem = item
      if (item.percent > percent) {
        break
      }
    }
    console.log('>>> 使用 ::', lastItem)
    return lastItem.color
  }
}

</script>

<style lang="scss">
.process-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
</style>
