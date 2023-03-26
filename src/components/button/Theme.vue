<template>
  <div class="btn">
    <XPopover refId="themeBtnPop" placement="top-start" trigger="click" :propTitle="t('View')">
      <template #reference>
        <el-button size="small" link>
          <SkinOutlined />
        </el-button>
      </template>

      <div class="enas-list">
        <div class="group-title">
          {{ t('Theme') }}
        </div>
        <div class="cur-ptr">
          <template v-for="(item, index) in AvailableThemes" v-bind:key="index">
            <div class="list-item" @click="onChangeTheme(item)">
              <div class="disp-flex">
                <div :class="`disp-flex flex-grow ${appStore.data.currentTheme === item ? ' font-bold highlight' : ''}`">
                  {{ item }}
                </div>
                <div class="disp-flex flex-grow justify-content-right ">
                  <div class="theme-color-box-group">
                    <div class="theme-color-box" :style="`background-color:var(--enas-background-primary-color_${item})`">
                    </div>
                    <div class="theme-color-box" :style="`background-color:var(--enas-foreground-primary-color_${item})`">
                    </div>
                    <div class="theme-color-box" :style="`background-color:var(--enas-highlight-color_${item})`"></div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </XPopover>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { SkinOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'

import { AvailableThemes } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { useSettingStore } from '@/pinia/modules/settings'
import XPopover from '@/components/widget/XPopover.vue'
import { saveConfToFile } from '@/libs/init/conf_file'
import { setTheme } from '@/utils/utils'

const { t } = useI18n()
const appStore = useAppStore()
const settingStore = useSettingStore()

const onChangeTheme = (themeName: string) => {
  setTheme(themeName)

  const setting = settingStore.data
  setting.appearance.theme = themeName
  settingStore.setData(setting, true)

  const appData = appStore.data
  appData.currentTheme = themeName
  appStore.setData(appData)

  saveConfToFile()

  if (settingStore.data.appearance.customBackagroundImg) {
    ElMessage({
      message: t('&Restart program'),
      type: 'info',
      showClose: true
    })
  }
}
</script>

<style lang="scss" scoped>
.theme-color-box-group {
  border: 1px solid #888;
  display: flex;
  height: 1em;
  margin-top: 0.5em;

  .theme-color-box {
    display: flex;
    width: 1em;
  }
}
</style>
