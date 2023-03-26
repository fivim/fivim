<template>
  <XPopover refId="listAddBtnPop" placement="top-start" trigger="click" :propTitle="t('Add')">
    <template #reference>
      <ElButton :icon="Plus" circle />
    </template>

    <div class="enas-list">
      <div class="list-item" @click="onAddNote">
        <FileTextOutlined /> {{ t('Note') }}
      </div>
    </div>
  </XPopover>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { FileTextOutlined, TableOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'

import XPopover from '@/components/widget/XPopover.vue'
import { TypeNote } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { usePanesStore } from '@/pinia/modules/panes'
import { NoteInfo } from '@/libs/user_data/types'
import { genFileName } from '@/utils/pinia_related'

const appStore = useAppStore()
const panesStore = usePanesStore()
const { t } = useI18n()

const addItem = (itemType: typeof TypeNote) => {
  const pd = panesStore.data
  if (pd.navigationCol.notebooks.length === 0) {
    ElMessage({
      message: t('&Please add notebook first.'),
      type: 'warning',
      showClose: true
    })

    return
  }

  const newItem: NoteInfo = {
    sign: genFileName(),
    title: t('Untitled'),
    icon: '',
    type: itemType,
    content: '',
    mtimeUtc: new Date(),
    ctimeUtc: new Date(),
    tagsArr: []
  }

  pd.listCol.list.push(newItem)
  pd.editorCol.title = newItem.title
  pd.editorCol.content = newItem.content
  panesStore.setData(pd)

  const info = appStore.data
  info.currentFile.sign = newItem.sign
  info.currentFile.indexInList = panesStore.data.listCol.list.length - 1
  info.currentFile.name = newItem.title
  info.currentFile.type = newItem.type
  appStore.setData(info)
}

const onAddNote = () => {
  addItem(TypeNote)
}
</script>
