<template>
  <div>
    <div v-if="panesStore.data.editorCol.sign === ''">
      <div class="empty py-2"> {{ t('&No content') }} </div>
    </div>
    <div v-else class="section max-h-full">
      <div class="title-bar">
        <div class="box mb-0 flex-nowrap gap-4">
          <div class="left">
            <div class="title">
              <el-input v-model="panesStore.data.editorCol.title" class="input" @input="onTitleInputNote"
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
          <EditorEditorjs ref="editorRef" class="note" :content="panesStore.data.editorCol.content || '{}'"
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
                  {{ fileInfo.sha256 }}
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
import { usePanesStore } from '@/pinia/modules/panes'
import { useSettingStore } from '@/pinia/modules/settings'
import { CmdInvoke } from '@/libs/commands'
import { getDataDirs } from '@/libs/init/dirs'
import { TagInfo, TypeNote, FileInfo } from '@/libs/user_data/types'
import { tmplFileInfo } from '@/libs/user_data/types_templates'
import { formatTime, restEditorCol, pathJoin } from '@/utils/pinia_related'
import { jsonCopy } from '@/utils/utils'

const appStore = useAppStore()
const panesStore = usePanesStore()
const settingStore = useSettingStore()
const { t } = useI18n()

let lastFileSign = ''
appStore.$subscribe((mutation, state) => {
  const info = state.data
  const currentFileSign = info.currentFile.sign

  if (isNote()) {
    // If file changed, update content.
    if (currentFileSign !== lastFileSign) {
      editorRef.value?.setContent(panesStore.data.editorCol.content || '{}')
    }
  }

  lastFileSign = currentFileSign
})

// ---------- note ----------
const isNote = () => {
  return panesStore.data.editorCol.type === TypeNote
}
const editorRef = ref<InstanceType<typeof EditorEditorjs>>()

const onTitleInputNote = (str: string) => {
  const info = appStore.data
  info.currentFile.name = str
  appStore.setData(info)

  const index = info.currentFile.indexInList
  const icd = panesStore.data.listCol
  icd.list[index].title = str
  panesStore.setListColData(icd)
}

const onEditorUpdate = (str: string) => {
  const icd = panesStore.data.listCol

  if (icd.list.length === 0) {
    // alert('Please create a new note first') // TODO: add translate
  } else {
    const index = appStore.data.currentFile.indexInList
    icd.list[index].content = str
    icd.list[index].mtimeUtc = new Date()
    panesStore.setListColData(icd)
  }
}
// ---------- note end ----------

// ---------- tag ----------
const tagExist = (sign: string) => {
  return panesStore.data.editorCol.tagsArr.indexOf(sign) >= 0
}

const onClickTag = (detail: TagInfo) => {
  const data = panesStore.data.editorCol
  const arr = data.tagsArr
  const index = arr.indexOf(detail.sign)

  if (index >= 0) { // If exist delete it
    arr.splice(index, 1)
  } else {
    arr.push(detail.sign)
  }

  panesStore.setEditorColData(data)
}
// ---------- tag end ----------

// ---------- file ----------
const isFile = () => {
  return panesStore.data.editorCol.type === TypeFile
}
const fileInfo = ref<FileInfo>(jsonCopy(tmplFileInfo))
const outPutDir = ref('')

const getFileInfo = () => {
  const ad = appStore.data
  const file = panesStore.data.navigationCol.files[ad.currentFile.indexInList] as FileInfo
  fileInfo.value = file

  // TODO preview images
}

const onDeleteFile = () => {
  ElMessageBox.confirm(t('Are you sure to delete this file: {name} ?', { name: fileInfo.value.title }))
    .then(async () => {
      if (fileInfo.value.sign) {
        const p = await getDataDirs()

        CmdInvoke.deleteFile(p.pathOfCurrentDir + fileInfo.value.sign).then((success) => {
          if (success) {
            const ad = appStore.data
            const pd = panesStore.data
            pd.navigationCol.files.splice(ad.currentFile.indexInList, 1)
            panesStore.setData(pd)

            restEditorCol()
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

const onExportFile = () => {
  openDialog({
    directory: true
  }).then(async (selected) => {
    outPutDir.value = selected as string
    if (outPutDir.value) {
      const p = await getDataDirs()
      const filePath = p.pathOfCurrentDir + fileInfo.value.sign
      const targetPath = await pathJoin([outPutDir.value, fileInfo.value.title])

      CmdInvoke.readUserDataFile('', filePath, false, 'bin', targetPath).then((fileData) => {
        console.log('>>> ExportFile ::', fileData)
        // TODO
      })
    }
  })
}

// ---------- file end ----------

panesStore.$subscribe((mutation, state) => {
  if (state.data.editorCol.type === TypeFile) {
    getFileInfo()
  }
})
</script>

<style lang="scss" scoped>
@import './common.scss';
@import './pane-editor.scss';
</style>
