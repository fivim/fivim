<!-- Set width to 100%, popper-class implements full screen display -->

<template>
  <el-popover :placement="placement" :trigger="trigger" :width="genWidth()" :popper-class="fullscreenClass()"
    ref="popoverRef" :visible="isItVisible()">
    <template #reference>
      <slot name="reference"></slot>
    </template>

    <!-- Title bar -->
    <div class="pop-title disp-flex" v-if="appStore.data.appMode === AppModeInfo.Mobile">
      <div class="disp-flex"> {{ propTitle }} </div>
      <div class="disp-flex"> <el-button v-if="isMobileMode()" :icon="Close" circle @click="onClosePop"></el-button>
      </div>
    </div>

    <slot></slot>

  </el-popover>
</template>

<script lang="ts" setup>
import { ref, unref, PropType } from 'vue'
import { Close } from '@element-plus/icons-vue'

import { AppModeInfo } from '@/types'
import { ElPropPlacement, ElPropTrigger } from '@/types_common'
import { useAppStore } from '@/pinia/modules/app'

const props = defineProps({
  refId: {
    type: String,
    required: true
  },
  visible: {
    type: Object,
    defalut: { value: null }
  },
  propTitle: {
    type: String
  },
  placement: {
    type: String as PropType<ElPropPlacement>,
    default: 'top-start'
  },
  trigger: {
    type: String as PropType<ElPropTrigger>,
    default: 'hover'
  },
  widthAuto: {
    type: Boolean,
    default: false
  },
  widthPx: {
    type: Number,
    default: 200
  }
})

const appStore = useAppStore()
const popoverRef = ref()

const isItVisible = () => {
  if (props.visible && props.visible.value !== null) {
    return props.visible.value
  }
  return null
}

const isMobileMode = () => {
  return appStore.data.appMode === AppModeInfo.Mobile
}
// To accomplish the mobile version full-screen display, need a class, and also sets the width to 100%
const fullscreenClass = () => {
  return isMobileMode() ? 'absolute w-full h-full top-0 left-0 transform-none' : ''
}

const onClosePop = () => {
  unref(popoverRef).hide()
}

const genWidth = () => {
  if (isMobileMode()) {
    return '100%'
  } else if (props.widthAuto) {
    return 'auto'
  }

  return props.widthPx
}
</script>

<style lang="scss">
.pop-title {
  justify-content: space-between;
  width: 100%;
}
</style>
