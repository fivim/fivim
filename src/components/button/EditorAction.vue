<template>
  <XPopover refId="editorActionBtnPop" placement="bottom-start" trigger="click" :propTitle="t('Icon')" :widthAuto="true">
    <template #reference>
      <el-button :icon="MoreFilled" circle />
    </template>

    <div class="py-2">
      <div class="enas-list cur-ptr">
        <template v-if="isNote()">
          <div class="list-item" @click.stop="onClickNoteDelete()">
            <el-icon>
              <Delete />
            </el-icon>
            {{ t('Delete') }}
          </div>
          <div class="list-item" @click.stop="onClickImport()">
            <el-icon>
              <Upload />
            </el-icon>
            {{ t('Import from {name}', { name: 'Markdown' }) }}
          </div>
          <div class="list-item" @click.stop="onClickExport()">
            <el-icon>
              <Download />
            </el-icon>
            {{ t('Export to {name}', { name: 'Markdown' }) }}
          </div>
        </template>
        <template v-else-if="isFile()">
          <div class="list-item" @click.stop="onExportFile()">
            <el-icon>
              <Download />
            </el-icon>
            {{ t('Export') }}
          </div>
          <div class="list-item" @click.stop="onShareFile()">
            <el-icon>
              <Share />
            </el-icon>
            {{ t('Share') }}
          </div>
          <div class="list-item" @click.stop="onClickFileDelete()">
            <el-icon>
              <Delete />
            </el-icon>
            {{ t('Delete') }}
          </div>
        </template>
      </div>
    </div>
  </XPopover>

  <!-- file share dialog -->
  <el-dialog v-model="tempShare.visible" :title="t('Share')" :width="genDialogWidth()">
    <el-form label-width="150px">
      <el-form-item :label="t('Output directory')">
        <div class="w-full">
          <el-button @click="onShareSelectOutPutDir">{{ t('Select') }}</el-button>
        </div>
        <div class="w-full">
          {{ tempShare.outputDir }}
        </div>
      </el-form-item>
      <el-form-item :label="t('Output file name')">
        <el-input v-model="tempShare.outputFileName" class="w-auto" type="shareOutputFileName" />
      </el-form-item>
      <el-form-item :label="t('Password')">
        <el-input v-model="tempShare.pwd" class="w-auto" />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="tempShare.visible = false">{{ t('Cancel') }}</el-button>
        <el-button type="primary" @click="onShareConfirm">
          {{ t('Confirm') }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Upload, Download, Share, Delete, MoreFilled } from '@element-plus/icons-vue'
import { open as openDialog } from '@tauri-apps/api/dialog'
import { join as pathJoin } from '@tauri-apps/api/path'

import { TaskDecrypt, TaskReEncrypt, TypeNone, TaskImportMd, TaskExportMd } from '@/constants'
import { MessagesInfo } from '@/types'
import { invoker } from '@/libs/commands/invoke'
import { genFilePwd } from '@/libs/commands'
import { getDataDirs } from '@/libs/init/dirs'
import { FileInfo } from '@/libs/user_data/types'
import { tmplFileInfo } from '@/libs/user_data/types_template'
import { deleteFileMeta, getCurrentNotebookIndexInList, getCurrentFileInList } from '@/libs/user_data/utils'
import XPopover from '@/components/widget/XPopover.vue'
import { useAppStore } from '@/pinia/modules/app'
import { isNote, isFile, restEditorCol, startProgressBar } from '@/utils/pinia_related'
import { genDialogWidth } from '@/utils/utils'

const appStore = useAppStore()
const { t } = useI18n()

// ---------- note ---------
const onClickNoteDelete = () => {
  ElMessageBox.confirm(t('&confirm delete note?', { name: fileInfo.value.title }))
    .then(async () => {
      const ad = appStore.data
      const index = getCurrentNotebookIndexInList()
      ad.listCol.listOfNote.splice(index, 1)
      appStore.setData(ad)

      restEditorCol()
    })
    .catch(() => {
      // catch error
    })
}

const onClickImport = () => {
  appStore.data.progress.simpleTaskName = TaskImportMd
}

const onClickExport = () => {
  appStore.data.progress.simpleTaskName = TaskExportMd
}
// ---------- note end ---------

// ---------- file ---------
const fileInfo = ref<FileInfo>(tmplFileInfo())

const getFileInfo = async () => {
  fileInfo.value = getCurrentFileInList()
}

const onClickFileDelete = () => {
  ElMessageBox.confirm(t('&confirm delete file?', { name: fileInfo.value.title }))
    .then(async () => {
      if (fileInfo.value.sign) {
        const p = await getDataDirs()

        invoker.deleteFile(p.pathOfCurrentDir + fileInfo.value.sign).then((success) => {
          if (success) {
            doDeleteFile(fileInfo.value.sign)
          } else {
            ElMessageBox.confirm(
              t('&confirm delete file information'),
              t('Warning'),
              {
                confirmButtonText: t('OK'),
                cancelButtonText: t('Cancel'),
                type: 'warning'
              }
            )
              .then(() => {
                doDeleteFile(fileInfo.value.sign)
              })
              .catch(() => {
                //
              })
          }
        })
      } else {
        // TODO alert
      }
    })
    .catch(() => {
      // catch error
    })
}

const doDeleteFile = (fileName: string) => {
  const ad = appStore.data
  const index = getCurrentNotebookIndexInList()
  ad.userData.files.splice(index, 1)
  appStore.setData(ad)

  deleteFileMeta(fileName)
  restEditorCol()
}
// ---------- file end ---------

// --------- file export ---------

const onExportFile = () => {
  openDialog({
    directory: true
  }).then(async (selected) => {
    const outputDir = selected as string

    if (outputDir) {
      if (!fileInfo.value.sign) {
        console.log('>>> file sign is empty, cannot export')

        return
      }

      const p = await getDataDirs()
      const filePath = p.pathOfCurrentDir + fileInfo.value.sign
      const targetPath = await pathJoin(outputDir, fileInfo.value.title)

      // progress bar
      if (appStore.data.progress.currentTask.percent > 0) {
        ElMessage(t(MessagesInfo.FileStillInProgress))
        return
      }
      const progressName = startProgressBar(TaskDecrypt, true)

      invoker.readUserDataFile(genFilePwd(''), filePath, false, TypeNone, targetPath, progressName)
    }
  })
}
// --------- file export end ---------

// --------- file share ---------
const tempShare = ref({
  visible: false,
  outputDir: '',
  outputFileName: '',
  pwd: ''
})

const onShareFile = () => {
  tempShare.value.visible = true
}

const onShareSelectOutPutDir = () => {
  openDialog({
    directory: true
  }).then((selected) => {
    tempShare.value.outputDir = selected as string
  })
}

const onShareConfirm = async () => {
  // progress bar
  if (appStore.data.progress.currentTask.percent > 0) {
    ElMessage(t(MessagesInfo.FileStillInProgress))
    return
  }
  const progressName = startProgressBar(TaskReEncrypt, true)

  tempShare.value.visible = false

  const p = await getDataDirs()
  const sourceFilePath = p.pathOfCurrentDir + fileInfo.value.sign
  const outputPath = await pathJoin(tempShare.value.outputDir, tempShare.value.outputFileName)

  invoker.reEncryptFile(genFilePwd(''), genFilePwd(tempShare.value.pwd), sourceFilePath, fileInfo.value.sign, outputPath, progressName).then((success) => {
    console.log('>>> onShareConfirm success ::', success)
  })
}

// --------- file share end ---------

if (isFile()) {
  getFileInfo()
}

appStore.$subscribe((mutation, state) => {
  if (isFile()) {
    getFileInfo()
  }
})
</script>

<style lang="scss"></style>
