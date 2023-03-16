import { defineStore } from 'pinia'
import { ref } from 'vue'

import { PaneData, ItemsColumnData, EditorColumnData, NavigationColumnData } from '@/components/pane/types'
import { EmptyPaneData } from '@/components/pane/types_template'

export const usePaneDataStore = defineStore('paneDataStore', () => {
  const data = ref<PaneData>(EmptyPaneData)

  const setData = (val: PaneData) => {
    data.value = val
  }

  const setEditorColumnData = (val: EditorColumnData) => {
    data.value.editorColumn = val
  }

  const setItemsColumnData = (val: ItemsColumnData) => {
    data.value.itemsColumn = val
  }

  const setNavigationColumnData = (val: NavigationColumnData) => {
    data.value.navigationColumn = val
  }

  return {
    data,
    setData,
    setEditorColumnData,
    setItemsColumnData,
    setNavigationColumnData
  }
})
