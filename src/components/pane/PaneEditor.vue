<template>
  <div>
    <div v-if="appStore.data.currentFile.subSign === ''">
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
            <SelectTagButton :tagExist="tagExist" :useIcon="true" @onClick="onClickTag" />
            <EditorAction></EditorAction>
          </div>
        </div>
      </div>

      <div class="editor-box">
        <template v-if="isNote()">
          <EditorEditorjs ref="editorRef" :content="appStore.data.currentFile.content || '{}'" class="note"
            @onUpdate="onEditorUpdate" />
        </template>
        <template v-else-if="isFile()">
          <EditorFile />
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import EditorEditorjs from '@/components/editor/Editorjs.vue'
import EditorFile from '@/components/editor/File.vue'
import EditorAction from '@/components/button/EditorAction.vue'
import SelectTagButton from '@/components/button/SelectTag.vue'

import { TypeNote } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { TagInfo } from '@/libs/user_data/types'
import { isNote, isFile } from '@/utils/pinia_related'
import { getCurrentNotebookIndexInList } from '@/libs/user_data/utils'

const appStore = useAppStore()
const { t } = useI18n()

// ---------- note ----------
const editorRef = ref<InstanceType<typeof EditorEditorjs>>()

const onTitleInputNote = (str: string) => {
  const ad = appStore.data
  ad.currentFile.title = str
  appStore.setData(ad)

  const index = getCurrentNotebookIndexInList()
  const icd = appStore.data.listCol
  icd.listOfNote[index].title = str
  appStore.setListColData(icd)
}

const onEditorUpdate = (str: string) => {
  const ad = appStore.data
  const icd = ad.listCol

  if (icd.listOfNote.length === 0) {
    // alert('Please create a new note first') // TODO: add translate
  } else {
    const index = getCurrentNotebookIndexInList()
    icd.listOfNote[index].content = str
    icd.listOfNote[index].mtimeUtc = new Date()
    appStore.setListColData(icd)
  }
}

let lastSubSign = ''
appStore.$subscribe((mutation, state) => {
  if (state.data.currentFile.type === TypeNote && lastSubSign !== state.data.currentFile.subSign) {
    editorRef.value?.setContent(appStore.data.currentFile.content)
  }

  lastSubSign = state.data.currentFile.subSign
})
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
</script>

<style lang="scss" scoped>
@import './common.scss';
@import './pane-editor.scss';
</style>
