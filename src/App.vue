<script setup lang="ts">
import { RouterView } from 'vue-router'

import { TaskChangeMasterPassword, TaskUpdateFilesSha256 } from '@/constants'
import { envIsDev } from '@/conf'
import { useAppStore } from '@/pinia/modules/app'
import { initCoreDirs } from '@/libs/init/dirs'
import { checkConfFileExist, initWithStartUpConfFile } from '@/libs/init/conf_file'
import { disableRightCilckAndDevTool } from '@/utils/utils'

import DesktopLockscreen from '@/components/layout/desktop/Lockscreen.vue'
import DesktopSetupWizard from '@/components/widget/SetupWizard.vue'
import LoadingChangeMasterPassword from '@/components/widget/LoadingChangeMasterPassword.vue'
import LoadingUpdateFilesSha256 from '@/components/widget/LoadingUpdateFilesSha256.vue'

if (!envIsDev) {
  disableRightCilckAndDevTool()
}

const appStore = useAppStore()

initCoreDirs().then(() => {
  initWithStartUpConfFile().then((res) => {
    //
  })

  checkConfFileExist()
})
</script>

<template>
  <div :class="appStore.data.textDirection === 'RTL' ? 'direction-rtl' : ''">
    <template v-if="appStore.data.settings.startupTask.taskName == TaskUpdateFilesSha256">
      <!-- Loading for update files sha256 -->
      <LoadingUpdateFilesSha256 />
    </template>
    <template v-else-if="appStore.data.progress.currentTask.taskName == TaskChangeMasterPassword">
      <!-- Loading for change master password -->
      <LoadingChangeMasterPassword />
    </template>
    <template v-else-if="appStore.data.existConfigFile">
      <!-- lockscreen -->
      <template v-if="appStore.data.lockscreen">
        <DesktopLockscreen />
      </template>
      <RouterView v-else />
    </template>
    <template v-else>
      <!-- setup wizard -->
      <template v-if="appStore.data.settings.encryption.masterPassword === ''">
        <DesktopSetupWizard />
      </template>
      <template v-else>
        Config file doesn't exist.
      </template>
    </template>
  </div>
</template>

<style lang="scss">
@import "@/styles/index.scss";
</style>
