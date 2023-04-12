<template>
  <div class="px-2 pb-2">
    <el-button :icon="Share" size="small" @click="onShareFile">{{ t('Share') }}</el-button>
    <el-button :icon="DocumentAdd" size="small" @click="onOpenFile">{{ t('Open') }}</el-button>

    <!-- file share dialog -->
    <el-dialog v-model="tempShare.visible" :title="t('Share')" :width="genDialogWidth()">
      <el-form label-width="150px">
        <el-form-item :label="t('File')">
          <div class="w-full">
            <el-button @click="onShareSelectFile">{{ t('Select') }}</el-button>
          </div>
          <div class="w-full">
            {{ tempShare.filePath }}
          </div>
        </el-form-item>
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

    <!-- file open dialog -->
    <el-dialog v-model="tempOpen.visible" :title="t('Open')" :width="genDialogWidth()">
      <el-form label-width="150px">
        <el-form-item :label="t('File')">
          <div class="w-full">
            <el-button @click="onOpenSelectFIle">{{ t('Select') }}</el-button>
          </div>
          <div class="w-full">
            {{ tempOpen.filePath }}
          </div>
        </el-form-item>
        <el-form-item :label="t('Output directory')">
          <div class="w-full">
            <el-button @click="onOpenSelectOutPutDir">{{ t('Select') }}</el-button>
          </div>
          <div class="w-full">
            {{ tempOpen.outputDir }}
          </div>
        </el-form-item>
        <el-form-item :label="t('Output file name')">
          <el-input v-model="tempOpen.outputFileName" class="w-auto" type="shareOutputFileName" />
        </el-form-item>
        <el-form-item :label="t('Password')">
          <el-input v-model="tempOpen.pwd" class="w-auto" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="tempOpen.visible = false">{{ t('Cancel') }}</el-button>
          <el-button type="primary" @click="onOpenConfirm">
            {{ t('Confirm') }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Share, DocumentAdd } from '@element-plus/icons-vue'
import { open as openDialog } from '@tauri-apps/api/dialog'
import { join as pathJoin } from '@tauri-apps/api/path'

import { MessagesInfo } from '@/types'
import { TaskDecrypt, TaskEncrypt, TypeNone } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { genFilePwd } from '@/libs/commands'
import { invoker } from '@/libs/commands/invoke'
import { startProgressBar } from '@/utils/pinia_related'
import { genDialogWidth } from '@/utils/utils'

const appStore = useAppStore()
const { t } = useI18n()

// ---------- share ----------
const tempShare = ref({
  visible: false,
  filePath: '',
  outputDir: '',
  outputFileName: '',
  pwd: ''
})

const onShareFile = () => {
  tempShare.value.visible = true
}

const onShareConfirm = async () => {
  // progress bar
  if (appStore.data.progress.currentTask.percent > 0) {
    ElMessage(t(MessagesInfo.FileStillInProgress))
    return
  }
  const progressName = startProgressBar(TaskEncrypt, true)

  tempShare.value.visible = false
  const sourcePath = tempShare.value.filePath
  const fileName = tempShare.value.outputFileName
  const dir = tempShare.value.outputDir
  const outputPath = await pathJoin(dir, fileName)

  invoker.writeUserDataFile(genFilePwd(tempShare.value.pwd), outputPath, fileName, {}, sourcePath, progressName).then((success) => {
    console.log('>>> onShareConfirm success ::', success)
  })
}

const onShareSelectFile = () => {
  openDialog({
    multiple: true
  }).then((selected) => {
    if (Array.isArray(selected)) {
      // user selected multiple files
      tempShare.value.filePath = selected[0]
    } else if (selected === null) {
      // user cancelled the selection
    } else {
      // user selected a single file
      tempShare.value.filePath = selected
    }
  })
}

const onShareSelectOutPutDir = () => {
  openDialog({
    directory: true
  }).then((selected) => {
    tempShare.value.outputDir = selected as string
  })
}
// ---------- share end ----------

// ---------- open end ----------
const tempOpen = ref({
  visible: false,
  filePath: '',
  outputDir: '',
  outputFileName: '',
  pwd: ''
})

const onOpenFile = () => {
  tempOpen.value.visible = true
}

const onOpenConfirm = async () => {
  // progress bar
  if (appStore.data.progress.currentTask.percent > 0) {
    ElMessage(t(MessagesInfo.FileStillInProgress))
    return
  }
  const progressName = startProgressBar(TaskDecrypt, true)

  tempOpen.value.visible = false
  const sourcePath = tempOpen.value.filePath
  const fileName = tempOpen.value.outputFileName
  const dir = tempOpen.value.outputDir
  const outputPath = await pathJoin(dir, fileName)

  invoker.readUserDataFile(genFilePwd(tempOpen.value.pwd), sourcePath, false, TypeNone, outputPath, progressName).then(async (fileData) => {
    console.log('>>> onOpenConfirm fileData ::', fileData)
  })
}

const onOpenSelectFIle = () => {
  openDialog({
    multiple: true
  }).then((selected) => {
    if (Array.isArray(selected)) {
      // user selected multiple files
      tempOpen.value.filePath = selected[0]
    } else if (selected === null) {
      // user cancelled the selection
    } else {
      // user selected a single file
      tempOpen.value.filePath = selected
    }
  })
}

const onOpenSelectOutPutDir = () => {
  openDialog({
    directory: true
  }).then((selected) => {
    tempOpen.value.outputDir = selected as string
  })
}
// ---------- open end ----------
</script>
