import { defineStore } from 'pinia'
import { ref } from 'vue'

import { PaneData, ListColData, EditorColData, NavigationColData } from '@/components/pane/types'
import { tmplPaneData } from '@/components/pane/types_template'

export const usePaneDataStore = defineStore('paneDataStore', () => {
  const data = ref<PaneData>(tmplPaneData)

  const setData = (val: PaneData) => {
    data.value = val
  }

  const setEditorColumnData = (val: EditorColData) => {
    data.value.editorCol = val
  }

  const setListColData = (val: ListColData) => {
    data.value.listCol = val
  }

  const setNavigationColumnData = (val: NavigationColData) => {
    data.value.navigationCol = val
  }

  return {
    data,
    setData,
    setEditorColumnData,
    setListColData,
    setNavigationColumnData
  }
})
