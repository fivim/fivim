<template>
  <div class="desktop-title-bar" data-tauri-drag-region>
    <template v-if="isMacOs">
      <WindowBtns :isMacOs="isMacOs" />

      <slot name="titleName"></slot>

      <div class="title-bar-ext-buttons" v-if="showExtButtons">
        <SettingButton />
        <ThemeButton />
        <SaveButton />
        <LockButton />
      </div>
    </template>
    <template v-else>
      <div class="title-bar-ext-buttons" v-if="showExtButtons">
        <SettingButton />
        <ThemeButton />
        <SaveButton />
        <LockButton />
      </div>

      <slot name="titleName"></slot>

      <WindowBtns :isMacOs="isMacOs" />
    </template>
  </div>
</template>

<script setup lang="ts" >
import { ref } from 'vue'

import LockButton from '@/components/button/LockScreen.vue'
import SaveButton from '@/components/button/Save.vue'
import SettingButton from '@/components/button/Setting.vue'
import ThemeButton from '@/components/button/Theme.vue'

import { CmdAdapter } from '@/libs/commands'
import WindowBtns from './WindowBtns.vue'

const props = defineProps({
  showExtButtons: {
    type: Boolean,
    default: () => (false),
    require: true
  }
})

const isMacOs = ref(false)

const checkIsMacOs = () => {
  CmdAdapter.isMacOs().then((trueOrFalse) => {
    isMacOs.value = trueOrFalse
  })
}
checkIsMacOs()

</script>

<style lang="scss">
@import "./desktop.scss";
</style>
