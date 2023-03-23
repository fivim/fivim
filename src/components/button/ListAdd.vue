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

import { Note } from '@/components/pane/types'
import XPopover from '@/components/UI_component/x_popover.vue'
import { DefaultFileNameRule, DocTypeNote } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { usePaneDataStore } from '@/pinia/modules/pane_data'
import { useSettingStore } from '@/pinia/modules/settings'
import { genTimeHashedSign } from '@/utils/hash'

const appStore = useAppStore()
const paneDataStore = usePaneDataStore()
const settingStore = useSettingStore()
const { t } = useI18n()

const addItem = (itemType: typeof DocTypeNote) => {
  const pd = paneDataStore.data
  if (pd.navigationCol.notebooks.length === 0) {
    ElMessage({
      message: t('&Please add notebook first.'),
      type: 'warning',
      showClose: true
    })

    return
  }
  const settingData = settingStore.data
  const newItem: Note = {
    hashedSign: genTimeHashedSign(settingData.encryption.fileNameRule || DefaultFileNameRule, settingData.appearance.dateTimeFormat, settingData.encryption.fileExt),
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
  paneDataStore.setData(pd)

  const info = appStore.data
  info.currentFile.hashedSign = newItem.hashedSign
  info.currentFile.indexInList = paneDataStore.data.listCol.list.length - 1
  info.currentFile.name = newItem.title
  info.currentFile.type = newItem.type
  appStore.setData(info)
}

const onAddNote = () => {
  addItem(DocTypeNote)
}
</script>
