<template>
  <div class="loading">
    <template v-if="isSuccess">
      <el-result icon="success" :title="t('Operation succeeded')">
        <template #extra>
          <el-button type="primary" @click="onClickOk()">
            {{ t('Ok') }}
          </el-button>
        </template>
      </el-result>
    </template>
    <template v-else-if="isFailure">
      <el-result icon="error" :title="t('Operation failure')">
        <template #extra>
          {{ message }}
        </template>
      </el-result>
    </template>
    <el-result v-else :title="taskTitle()">
      <template #extra>
        <div class="w-full">
          <el-row :gutter="10">
            <el-col :xs="24">
              <div>
                {{ currentFileIndex }}
                /
                {{ totalFilesCount }}
              </div>
            </el-col>
            <el-col :xs="24">
              <el-progress :percentage="globalPercent()" :color="progressColor" :text-inside="true" :stroke-width="26" />
            </el-col>
          </el-row>
        </div>
      </template>
      <template #sub-title>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { TaskUpdateFilesSha256 } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { getAllFilesMeta, updateFileMeta } from '@/libs/user_data/utils'

const appStore = useAppStore()
const { t } = useI18n()

const progressColor = ref('var(--enas-highlight-color)')
const isSuccess = ref(false)
const isFailure = ref(false)
const message = ref('')
const currentFileIndex = ref(0)
const totalFilesCount = ref(0)

const taskTitle = () => {
  const name = t(TaskUpdateFilesSha256)
  return t('is in progress', { name })
}

const globalPercent = () => {
  return Math.floor(currentFileIndex.value / totalFilesCount.value * 100) || 0
}

const onClickOk = () => {
  const settings = appStore.data.settings
  settings.startupTask.taskName = 'None'

  appStore.setSettingData(settings, true)
}

const start = async () => {
  const allFilesArr = getAllFilesMeta()
  totalFilesCount.value = allFilesArr.length

  for (const item of allFilesArr) {
    const success = await updateFileMeta(item.sign)
    if (success) {
      currentFileIndex.value++
    }
  }

  if (currentFileIndex.value === totalFilesCount.value) {
    isSuccess.value = true
  } else {
    isFailure.value = true
  }
}

// Wait for initialization to complete.
setTimeout(start, 300)
</script>

<style lang="scss" scoped>
@import './loading.scss';
</style>
