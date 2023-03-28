<template>
  <div>
    <div v-if="appStore.data.currentFile.sign === ''">
      <div class="empty py-2"> {{ t('&No content') }} </div>
    </div>
    <div v-else class="section max-h-full">
      <div class="title-bar">
        <div class="box mb-0 flex-nowrap gap-4">
          <div class="left">
            <div class="title">
              <el-input v-model="appStore.data.currentFile.title" class="input" @input="onTitleInputNote"
                :disabled="isFile()" />
            </div>
          </div>

          <div class="right note-view-options-buttons ">
            <el-button-group>
              <SelectTagButton :tagExist="tagExist" :useIcon="true" @onClick="onClickTag" />
            </el-button-group>
          </div>
        </div>
      </div>

      <div class="editor-box">
        <template v-if="isNote()">
          <EditorEditorjs ref="editorRef" class="note" :content="appStore.data.currentFile.content || '{}'"
            @onUpdate="onEditorUpdate" />
        </template>
        <template v-else-if="isFile()">
          <div class="file">
            <el-form label-width="100px" v-if="fileInfo.sign">
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
              <el-form-item label="size">
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
              <p></p>
              <el-button type="primary" @click="onExportFile">{{ t('Export data') }}</el-button>
              <el-button type="primary" @click="onDeleteFile">{{ t('Delete') }}</el-button>
            </div>
          </div>

        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessageBox } from 'element-plus'
import { open as openDialog } from '@tauri-apps/api/dialog'

import EditorEditorjs from '@/components/editor/Editorjs.vue'
import SelectTagButton from '@/components/button/SelectTag.vue'
import SmallTagList from '@/components/widget/SmallTagList.vue'

import { TypeFile } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { genFilePwd } from '@/libs/commands'
import { invoker } from '@/libs/commands/invoke'
import { getDataDirs } from '@/libs/init/dirs'
import { TagInfo, TypeNote, FileInfo } from '@/libs/user_data/types'
import { tmplFileInfo } from '@/libs/user_data/types_templates'
import { deleteFileMeta } from '@/libs/user_data/utils'
import { formatTime, restEditorCol, pathJoin } from '@/utils/pinia_related'
import { happybytes } from '@/utils/bytes'
import { jsonCopy } from '@/utils/utils'

const appStore = useAppStore()
const { t } = useI18n()

let lastFileSign = ''
appStore.$subscribe((mutation, state) => {
  const info = state.data
  const currentFileSign = info.currentFile.sign

  if (state.data.currentFile.type === TypeNote) {
    // If file changed, update content.
    if (currentFileSign !== lastFileSign) {
      editorRef.value?.setContent(appStore.data.currentFile.content || '{}')
    }
  }

  if (state.data.currentFile.type === TypeFile) {
    getFileInfo()
  }

  lastFileSign = currentFileSign
})

// ---------- note ----------
const isNote = () => {
  return appStore.data.currentFile.type === TypeNote
}

const editorRef = ref<InstanceType<typeof EditorEditorjs>>()

const onTitleInputNote = (str: string) => {
  const ad = appStore.data
  ad.currentFile.title = str
  appStore.setData(ad)

  const index = ad.currentFile.indexInList
  const icd = appStore.data.listCol
  icd.noteList[index].title = str
  appStore.setListColData(icd)
}

const onEditorUpdate = (str: string) => {
  const icd = appStore.data.listCol

  if (icd.noteList.length === 0) {
    // alert('Please create a new note first') // TODO: add translate
  } else {
    const index = appStore.data.currentFile.indexInList
    icd.noteList[index].content = str
    icd.noteList[index].mtimeUtc = new Date()
    appStore.setListColData(icd)
  }
}
// ---------- note end ----------

// ---------- tag ----------
const tagExist = (sign: string) => {
  return appStore.data.currentFile.tagsArr.indexOf(sign) >= 0
}

const onClickTag = (detail: TagInfo) => {
  const data = appStore.data.currentFile
  const arr = data.tagsArr
  const index = arr.indexOf(detail.sign)

  if (index >= 0) { // If exist delete it
    arr.splice(index, 1)
  } else {
    arr.push(detail.sign)
  }

  appStore.setCurrentFile(data)
}
// ---------- tag end ----------

// ---------- file ----------
const isFile = () => {
  return appStore.data.currentFile.type === TypeFile
}
const fileInfo = ref<FileInfo>(jsonCopy(tmplFileInfo))
const outPutDir = ref('')

const getFileInfo = () => {
  const ad = appStore.data
  const file = ad.userData.files[ad.currentFile.indexInList] as FileInfo
  fileInfo.value = file

  // TODO preview images
}

const onDeleteFile = () => {
  ElMessageBox.confirm(t('Are you sure to delete this file: {name} ?', { name: fileInfo.value.title }))
    .then(async () => {
      if (fileInfo.value.sign) {
        const p = await getDataDirs()

        invoker.deleteFile(p.pathOfCurrentDir + fileInfo.value.sign).then((success) => {
          if (success) {
            doDeleteFile(fileInfo.value.sign)
          } else {
            ElMessageBox.confirm(
              'Failed to delete the file, do you want to delete the recorded information?',
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
  ad.userData.files.splice(ad.currentFile.indexInList, 1)
  appStore.setData(ad)

  deleteFileMeta(fileName)
  restEditorCol()
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

      invoker.readUserDataFile(genFilePwd(''), filePath, false, 'none', targetPath).then((fileData) => {
        console.log('>>> ExportFile ::', fileData)
        // TODO
      })
    }
  })
}

// ---------- file end ----------
</script>

<style lang="scss" scoped>
@import './common.scss';
@import './pane-editor.scss';
</style>
