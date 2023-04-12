<template>
  <div class="btn">
    <XPopover refId="windowExtActionBtnPop" placement="bottom-start" trigger="click" :propTitle="t('Icon')"
      :widthAuto="true" :visible="visibleMenu">
      <template #reference>
        <el-button size="small" link @click="onTogglePopover()">
          <MoreOutlined />
        </el-button>
      </template>

      <div class="enas-list cur-ptr">
        <div class="list-item">
          <!-- <SettingButton /> -->
          <div class="btn">
            <el-button size="small" link @click.stop="onClickDialogVisibleSetting()">
              <SettingOutlined />
              <span class="p-2">{{ t('Setting') }}</span>
            </el-button>
          </div>
        </div>
        <div class="list-item">
          <ThemeButton />
        </div>
        <div class="list-item" @click="onTogglePopover">
          <!-- <AboutButton /> -->
          <div class="btn">
            <el-button size="small" link @click.stop="onClickDialogVisibleAbout()">
              <InfoCircleOutlined />
              <span class="p-2">{{ t('About') }}</span>
            </el-button>
          </div>
        </div>
      </div>
    </XPopover>

    <SettingButton :dialogVisible="dialogVisibleSetting" ref="refSetting" />
    <AboutButton :dialogVisible="dialogVisibleAbout" ref="refAbout" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { MoreOutlined, SettingOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'

import SettingButton from '@/components/button/Setting.vue'
import ThemeButton from '@/components/button/Theme.vue'
import AboutButton from '@/components/button/About.vue'

import XPopover from '@/components/widget/XPopover.vue'

const { t } = useI18n()

// ---------- menu ----------
const visibleMenu = ref({ value: false })
const onTogglePopover = () => {
  visibleMenu.value.value = !visibleMenu.value.value
  // return true
}

// ---------- setting ----------
const dialogVisibleSetting = ref(false)
const refSetting = ref()

const onClickDialogVisibleSetting = () => {
  onTogglePopover()
  dialogVisibleSetting.value = !dialogVisibleSetting.value
  refSetting.value.onOpen()
}

// ---------- about ----------
const dialogVisibleAbout = ref(false)
const refAbout = ref()
const onClickDialogVisibleAbout = () => {
  onTogglePopover()
  dialogVisibleAbout.value = !dialogVisibleAbout.value
  refAbout.value.onOpen()
}
</script>

<style lang="scss" scoped></style>
