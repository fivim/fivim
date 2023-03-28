<template>
  <div class="desktop-title-bar">
    <BackgroundProcessBar :percent="appStore.data.currentProgress.percent" :height="`var(--enas-desktop-title-bar-height)`"
      :colorMap="fileOperateProcessData" :zIndex="`var(--enas-z-index-title-bar-process-bar)`" />

    <div class="content">
      <div class="inner" data-tauri-drag-region>

        <template v-if="isMacOs">
          <WindowBtns :isMacOs="isMacOs" />

          <slot name="titleName"></slot>

          <div class="title-bar-ext-buttons" v-if="showExtButtons">
            <SettingButton />
            <ThemeButton />
            <SyncButton />
            <SaveButton />
            <LockButton />
          </div>
        </template>
        <template v-else>
          <div class="title-bar-ext-buttons" v-if="showExtButtons">
            <SettingButton />
            <ThemeButton />
            <SyncButton />
            <SaveButton />
            <LockButton />
          </div>

          <slot name="titleName"></slot>

          <WindowBtns :isMacOs="isMacOs" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" >
import { ref } from 'vue'

import BackgroundProcessBar from '@/components/widget/BackgroundProcessBar.vue'
import LockButton from '@/components/button/LockScreen.vue'
import SaveButton from '@/components/button/Save.vue'
import SyncButton from '@/components/button/Sync.vue'
import SettingButton from '@/components/button/Setting.vue'
import ThemeButton from '@/components/button/Theme.vue'

import { fileOperateProcessData } from '@/conf'
import { CmdAdapter } from '@/libs/commands'
import { useAppStore } from '@/pinia/modules/app'

import WindowBtns from './WindowBtns.vue'

const props = defineProps({
  showExtButtons: {
    type: Boolean,
    default: () => (false),
    require: true
  }
})

const appStore = useAppStore()
const isMacOs = ref(false)

const checkIsMacOs = () => {
  CmdAdapter().isMacOs().then((trueOrFalse) => {
    isMacOs.value = trueOrFalse
  })
}
checkIsMacOs()

</script>

<style lang="scss">
@import "./desktop.scss";
</style>
