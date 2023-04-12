<!-- The value of el-select in el-popover changed will close el-popover. -->
<!-- So, we don't trigger the visibility of setting dialog inside the component. -->

<template>
  <!--
  <div class="btn">
    <el-button size="small" link @click="visible = true">
      <InfoCircleOutlined />
      <span class="p-2">{{ t('About') }}</span>
    </el-button>
  </div>
  -->

  <!-- about dialog -->
  <el-dialog v-model="visible" :title="t('About')" :width="genDialogWidthSmall()">
    <el-result icon="info" :title="appStore.data.appName">
      <template #icon> </template>
      <template #sub-title>
        <p>Version: {{ appStore.data.version }}</p>
      </template>
      <template #extra>
        {{ appStore.data.appRepo }}
      </template>
    </el-result>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
// import { InfoCircleOutlined } from '@ant-design/icons-vue'

import { useAppStore } from '@/pinia/modules/app'
import { genDialogWidthSmall } from '@/utils/utils'

const appStore = useAppStore()
const { t } = useI18n()

const visible = ref(false)

const onOpen = () => {
  visible.value = true
}

defineExpose({ onOpen })
</script>

<style lang="scss" scoped>
.el-result {
  padding: 0 !important;
}
</style>

<style lang="scss">
.el-result__title,
.el-result__extra {
  margin-top: 1rem !important;
}
</style>
