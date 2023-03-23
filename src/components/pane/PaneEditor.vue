<template>
  <div>
    <div v-if="paneDataStore.data.editorCol.hashedSign === ''">
      <div class="empty py-2"> {{ t('&No content') }} </div>
    </div>
    <div v-else class="section max-h-full">
      <div class="title-bar">
        <div class="box mb-0 flex-nowrap gap-4">
          <div class="left">
            <div class="title">
              <el-input v-model="paneDataStore.data.editorCol.title" class="input" @input="onTitleInput" />
            </div>
          </div>

          <div class="right note-view-options-buttons ">
            <el-button-group>
              <SelectTagButton :tagExist="tagExist" :useIcon="true" @onClick="onClickTag"> </SelectTagButton>
            </el-button-group>
          </div>
        </div>
      </div>

      <div>
        <EditorEditorjs ref="editorRef" :content="paneDataStore.data.editorCol.content || '{}'" @onUpdate="onEditorUpdate"
          :class="`${paneDataStore.data.editorCol.type === DocTypeNote ? 'pos-rel' : 'disp-none'} note`" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import EditorEditorjs from '@/components/editor/Editorjs.vue'
import SelectTagButton from '@/components/button/SelectTag.vue'

import { DocTypeNote } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { usePaneDataStore } from '@/pinia/modules/pane_data'
import { Tag } from '@/components/pane/types'

const appStore = useAppStore()
const paneDataStore = usePaneDataStore()
const { t } = useI18n()
const editorRef = ref<InstanceType<typeof EditorEditorjs>>()

const onTitleInput = (str: string) => {
  const info = appStore.data
  info.currentFile.name = str
  appStore.setData(info)

  const index = info.currentFile.indexInList
  const icd = paneDataStore.data.listCol
  icd.list[index].title = str
  paneDataStore.setListColData(icd)
}

const onEditorUpdate = (str: string) => {
  const icd = paneDataStore.data.listCol

  if (icd.list.length === 0) {
    // alert('Please create a new note first') // TODO: add translate
  } else {
    const index = appStore.data.currentFile.indexInList
    icd.list[index].content = str
    icd.list[index].mtimeUtc = new Date()
    paneDataStore.setListColData(icd)
  }
}

const tagExist = (hashedSign: string) => {
  return paneDataStore.data.editorCol.tagsArr.indexOf(hashedSign) >= 0
}

const onClickTag = (detail: Tag) => {
  const data = paneDataStore.data.editorCol
  const arr = data.tagsArr
  const index = arr.indexOf(detail.hashedSign)

  if (index >= 0) { // If exist delete it
    arr.splice(index, 1)
  } else {
    arr.push(detail.hashedSign)
  }

  paneDataStore.setEditorColData(data)
}

let lastFileHashedSign = ''
appStore.$subscribe((mutation, state) => {
  const info = state.data
  const currentFileHashedSign = info.currentFile.hashedSign
  if (currentFileHashedSign !== lastFileHashedSign) {
    editorRef.value?.setContent(paneDataStore.data.editorCol.content || '{}')
  }

  lastFileHashedSign = currentFileHashedSign
})
</script>

<style lang="scss" scoped>
@import './common.scss';
@import './pane-editor.scss';
</style>
