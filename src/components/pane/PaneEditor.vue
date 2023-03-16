<template>
  <div>
    <div class="section editor max-h-full">
      <div class="title-bar">
        <div class="box mb-0 flex-nowrap gap-4">
          <div class="left">
            <div class="title">
              <el-input v-model="paneDataStore.data.editorColumn.title" class="input" @input="onTitleInput" />
            </div>
          </div>

          <div class="right note-view-options-buttons ">
            <el-button-group>
              <ChangeEditorButton />
            </el-button-group>
          </div>
        </div>
      </div>

      <div>
        <EditorEditorjs :class="`${paneDataStore.data.editorColumn.type === DocTypeNote ? 'pos-rel' : 'disp-none'} note`"
          ref="editorRef" :content="paneDataStore.data.editorColumn.content || '{}'" @editorUpdate="onEditorUpdate" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import { DefaultNoteSummaryLimit, DocTypeNote } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { usePaneDataStore } from '@/pinia/modules/pane_data'
import ChangeEditorButton from '@/components/button/EditorTag.vue'
import EditorEditorjs from '@/components/editor/editorjs/Editorjs.vue'

const appStore = useAppStore()
const paneDataStore = usePaneDataStore()
const editorRef = ref<InstanceType<typeof EditorEditorjs>>()

const onTitleInput = (str: string) => {
  const info = appStore.data
  info.currentFile.name = str
  appStore.setData(info)

  const index = info.currentFile.indexInItemsList
  const icd = paneDataStore.data.itemsColumn
  icd.list[index].title = str
  paneDataStore.setItemsColumnData(icd)
}

const onEditorUpdate = (str: string) => {
  const icd = paneDataStore.data.itemsColumn
  if (icd.list.length === 0) {
    // alert('Please create a new note first') // TODO: translate
  } else {
    const index = appStore.data.currentFile.indexInItemsList
    icd.list[index].content = str
    icd.list[index].updateTime = new Date()
    paneDataStore.setItemsColumnData(icd)
  }
}

let lastFileHashedSign = ''
appStore.$subscribe((mutation, state) => {
  const info = state.data
  const currentFileHashedSign = info.currentFile.hashedSign
  if (currentFileHashedSign !== lastFileHashedSign) {
    // TODO: save previous content as locally history
    // editorRef.value?.editorUpdate(paneDataStore.data.itemsColumn.list[info.currentFile.indexInItemsList].content)
  }

  lastFileHashedSign = currentFileHashedSign
})
</script>

<style lang="scss" scoped>
@import './pane-editor.scss';
</style>
