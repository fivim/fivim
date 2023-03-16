<script setup lang="ts">
import { RouterView } from 'vue-router'

import { envIsDev } from '@/conf'
import { useAppStore } from '@/pinia/modules/app'
import { useSettingStore } from '@/pinia/modules/settings'
import { initDataDirs } from '@/utils/pinia_data_related'
import { disableRightCilckAndDevTool } from '@/utils/utils'

import DesktopLockscreen from '@/components/layout/desktop/Lockscreen.vue'
import DesktopSetupWizard from '@/components/layout/desktop/SetupWizard.vue'

if (!envIsDev) {
  disableRightCilckAndDevTool()
}

const appStore = useAppStore()
const settingStore = useSettingStore()

initDataDirs()
</script>

<template>
  <div :class="appStore.data.textDirection === 'RTL' ? 'direction-rtl' : ''">
    <template v-if="appStore.data.existConfigFile">
      <!-- lockscreen -->
      <template v-if="appStore.data.lockscreen">
        <DesktopLockscreen />
      </template>
      <RouterView v-else />
    </template>

    <template v-else>
      <!-- setup wizard -->
      <template v-if="settingStore.data.encryption.masterPassword === ''">
        <DesktopSetupWizard />
      </template>

    </template>
  </div>
</template>

<style lang="scss">
@import "@/styles/index.scss";
</style>
