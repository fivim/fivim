<template>
  <div class="title-bar-window-buttons">
    <template v-if="isMacOs">
      <button class="btn" @click="onWinClose">
        <CloseOutlined />
      </button>
      <button class="btn" @click="onWinMin">
        <MinusOutlined />
      </button>
      <button class="btn" @click="onWinMax2Min">
        <FullscreenExitOutlined v-if="isFullscreen" />
        <FullscreenOutlined v-else />
      </button>
    </template>

    <template v-else>
      <button class="btn" @click="onWinMin">
        <MinusOutlined />
      </button>
      <button class="btn" @click="onWinMax2Min">
        <FullscreenExitOutlined v-if="isFullscreen" />
        <FullscreenOutlined v-else />
      </button>
      <button class="btn" @click="onWinClose">
        <CloseOutlined />
      </button>
    </template>
  </div>
</template>

<script setup lang="ts" >
import { onMounted, reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import {
  FullscreenOutlined,
  MinusOutlined, FullscreenExitOutlined, CloseOutlined
} from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import { appWindow } from '@tauri-apps/api/window'
import { listen } from '@tauri-apps/api/event'
import { exit } from '@tauri-apps/api/process'

const props = defineProps({
  isMacOs: {
    type: Boolean,
    required: true
  }
})

const { t } = useI18n()
const data = reactive({ isMaximized: false, isResizable: true })

onMounted(async () => {
  data.isMaximized = await appWindow.isMaximized()
  data.isResizable = await appWindow.isResizable()
  listen('tauri://resize', async () => { data.isMaximized = await appWindow.isMaximized() })
})

const isFullscreen = ref(false)
const checkIsFullscreen = () => {
  appWindow.isFullscreen().then((data) => {
    isFullscreen.value = data
  })
}
checkIsFullscreen()

// minimize window
const onWinMin = async () => {
  await appWindow.minimize()
}

// toggleMaximize window
const onWinMax2Min = async () => {
  const resizable = await appWindow.isResizable()
  if (!resizable) {
    return
  }
  await appWindow.toggleMaximize()
  isFullscreen.value = !isFullscreen.value
}

// close window
const onWinClose = async () => {
  if (appWindow.label.indexOf('main') > -1) {
    ElMessageBox.confirm(
      t('&Confirm exit'),
      t('Tip'),
      {
        confirmButtonText: t('Exit'),
        cancelButtonText: t('Hide to tray'),
        type: 'warning'
      }
    ).then(() => {
      exit()
    }).catch(() => {
      appWindow.hide()
    })
  } else {
    await appWindow.close()
  }
}
</script>

<style lang="scss"></style>
