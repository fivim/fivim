<template>
  <div class="file">
    <el-form label-width="100px" class="small" v-if="fileInfo.sign">
      <el-form-item :label="t('Created')">
        {{ formatTime(fileInfo.ctimeUtc) }}
      </el-form-item>
      <el-form-item :label="t('Updated')">
        {{ formatTime(fileInfo.mtimeUtc) }}
      </el-form-item>
      <el-form-item label="sha256">
        <div class="text-break-all">
          {{ fileInfo.originalSha256 }}
        </div>
      </el-form-item>
      <el-form-item :label="t('Size')">
        <div class="text-break-all">
          {{ happybytes(fileInfo.originalSize || 0, false) }} ({{ fileInfo.originalSize }})
        </div>
      </el-form-item>
      <el-form-item :label="t('Tag')">
        <SmallTagList :tagsArr="fileInfo.tagsArr"></SmallTagList>
      </el-form-item>
      <el-form-item label="Remark">
        <el-input v-model="fileInfo.content" type="textarea" :rows="5" />
      </el-form-item>
    </el-form>

    <div class="p-2">
      <el-button type="primary" @click="onExportFile">{{ t('Export data') }}</el-button>

      <el-popover v-if="showPreviewBtn" placement="top" :width="200" trigger="click">
        <template #reference>
          <el-button style="margin-right: 16px">{{ t('Preview') }}</el-button>
        </template>
        <el-image style="width: 200px; max-height: 200px" :src="fileBase64" fit="scale-down" />
      </el-popover>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { open as openDialog } from '@tauri-apps/api/dialog'

import SmallTagList from '@/components/widget/SmallTagList.vue'

import { TypeFile, RreviewFileSizeMax, TaskDecrypt } from '@/constants'
import { MessagesInfo } from '@/types'
import { useAppStore } from '@/pinia/modules/app'
import { genFilePwd } from '@/libs/commands'
import { invoker } from '@/libs/commands/invoke'
import { getDataDirs } from '@/libs/init/dirs'
import { FileInfo } from '@/libs/user_data/types'
import { tmplFileInfo } from '@/libs/user_data/types_templates'
import { formatTime, pathJoin, listenProgressStatus } from '@/utils/pinia_related'
import { happybytes } from '@/utils/bytes'
import { genUuidv4 } from '@/utils/hash'
import { jsonCopy, fileNameIsImage, getFileNameExt } from '@/utils/utils'

const appStore = useAppStore()
const { t } = useI18n()

// ---------- file ----------
const fileInfo = ref<FileInfo>(jsonCopy(tmplFileInfo))
const outPutDir = ref('')
const fileBase64 = ref('')
const showPreviewBtn = ref(false)

const getFileInfo = async () => {
  const ad = appStore.data
  const file = ad.userData.files[ad.currentFile.indexInList] as FileInfo
  fileInfo.value = file

  if (fileNameIsImage(file.title) && file.originalSize < RreviewFileSizeMax) {
    showPreviewBtn.value = true

    const p = await getDataDirs()
    const filePath = p.pathOfCurrentDir + fileInfo.value.sign
    invoker.readUserDataFile(genFilePwd(''), filePath, false, 'base64', '', '').then((fileData) => {
      fileBase64.value = `data:image/${getFileNameExt(file.title)};base64,${fileData.file_data_str}`
    })
  } else {
    showPreviewBtn.value = false
    fileBase64.value = ''
  }
}

const onExportFile = () => {
  openDialog({
    directory: true
  }).then(async (selected) => {
    outPutDir.value = selected as string
    if (outPutDir.value) {
      const p = await getDataDirs()
      const filePath = p.pathOfCurrentDir + fileInfo.value.sign
      const targetPath = await pathJoin([outPutDir.value, fileInfo.value.title])

      // progress bar
      if (appStore.data.currentProgress.percent > 0) {
        ElMessage(t(MessagesInfo.FileStillInProgress))
        return
      }
      const progressName = genUuidv4()
      listenProgressStatus(progressName, TaskDecrypt)

      invoker.readUserDataFile(genFilePwd(''), filePath, false, 'none', targetPath, progressName)
    }
  })
}

getFileInfo()

appStore.$subscribe((mutation, state) => {
  if (state.data.currentFile.type === TypeFile) {
    getFileInfo()
  }
})
// ---------- file end ----------
</script>

<style lang="scss" scoped></style>
