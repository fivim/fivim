<template>
  <div class="loading">

    <template v-if="appStore.data.progress.currentTask.isSuccess">
      <el-result icon="success" :title="t('Operation succeeded')">
        <template #extra>
          <div class="p-2">
            <el-alert :title="t('&The backup directory is {path}', { path: appStore.data.progress.currentTask.message })"
              type="success" :closable="false" />
          </div>

          <el-button type="primary" @click="reStart()">
            {{ t('Reload') }}
          </el-button>
        </template>
      </el-result>
    </template>
    <template v-else-if="appStore.data.progress.currentTask.isFailure">
      <el-result icon="error" :title="t('Operation failure')">
        <template #extra>
          <div class="p-2">
            {{ appStore.data.progress.currentTask.message }}
          </div>

          <el-button type="primary" @click="appStore.data.progress.currentTask.taskName = 'None'">
            {{ t('Ok') }}
          </el-button>
        </template>
      </el-result>
    </template>
    <el-result v-else :title="taskTitle()">
      <template #extra>
        <div class="w-full">
          <el-row :gutter="10">
            <!-- ---------- global progress ---------- -->
            <el-col :xs="24">
              <div>
                {{ appStore.data.progress.changeMasterPassword.currentFileIndex }}
                /
                {{ appStore.data.progress.changeMasterPassword.totalFilesCount }}
              </div>
            </el-col>
            <el-col :xs="24">
              <el-progress :percentage="globalPercent()" :color="progressColor" :text-inside="true" :stroke-width="26" />
            </el-col>
            <!-- ----------global progress end ---------- -->

            <!-- ---------- current file progress ---------- -->
            <el-col :xs="24">
              <div>{{ appStore.data.progress.changeMasterPassword.currentFileName }}</div>
              <div>
                {{ t('File size: {size}', {
                  size: happybytes(appStore.data.progress.changeMasterPassword.currentFileSize, false)
                }) }}
              </div>
              <el-progress :percentage="appStore.data.progress.currentTask.percent" :color="progressColor"
                :text-inside="true" :stroke-width="26" />
            </el-col>
            <!-- ---------- current file progress end ---------- -->
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

import { TaskChangeMasterPassword, TaskUpdateFilesSha256 } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { initAtFirst } from '@/libs/init/at_first'
import { happybytes } from '@/utils/bytes'
import { tmplProgress } from '@/types_template'

const appStore = useAppStore()
const { t } = useI18n()

const progressColor = ref('var(--enas-highlight-color)')

const taskTitle = () => {
  const name = t(TaskChangeMasterPassword)
  return t('is in progress', { name })
}

const globalPercent = () => {
  return Math.floor((appStore.data.progress.changeMasterPassword.currentFileIndex - 1) / appStore.data.progress.changeMasterPassword.totalFilesCount * 100) || 0
}

const reStart = () => {
  // Add a task for next startup.
  const settings = appStore.data.settings
  settings.startupTask = {
    percent: 0,
    taskName: TaskUpdateFilesSha256,
    isFailure: false,
    isSuccess: false,
    message: ''
  }
  appStore.data.progress = tmplProgress()
  appStore.setSettingData(settings, true).then(() => {
    initAtFirst(settings.encryption.masterPassword, true).then(() => {
      //
    })
  })
}
</script>

<style lang="scss" scoped>
@import './loading.scss';
</style>
