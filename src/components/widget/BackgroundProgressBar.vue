<template>
  <div class="process-bar">
    <div class="pos-rel">
      <div class="colors">
      </div>
      <div class="shade" :style="`width:${getShadeWidth()};`"></div>
    </div>
  </div>
</template>

<script setup lang="ts" >
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
  barHeight: {
    type: String,
    default: () => ('40px'),
    require: true
  },
  zIndex: {
    type: String,
    default: () => ('1'),
    require: true
  }
})

const getShadeWidth = () => {
  return (100 - props.percent).toFixed() + '%'
}
</script>

<style lang="scss">
$barHeight : 4px;

.process-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: var(--enas-z-index-title-bar-progress-bar);
  height: var(--enas-desktop-title-bar-height);

  .colors {
    height: $barHeight;
    background-image: linear-gradient(to right, var(--enas-progress-bar-start-color), var(--enas-progress-bar-middle-color), var(--enas-progress-bar-end-color));
  }

  .shade {
    position: absolute;
    top: 0;
    right: 0;
    height: $barHeight;
    background-color: var(--enas-title-bar-background-color) !important;
  }
}
</style>
