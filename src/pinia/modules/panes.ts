import { defineStore } from 'pinia'
import { ref } from 'vue'

import { TypeNone } from '@/constants'
import { PaneData, ListColData, EditorColData, NavigationColData } from '@/components/pane/types'
import { tmplPaneData } from '@/components/pane/types_template'
import { jsonCopy } from '@/utils/utils'

export const usePanesStore = defineStore('panesStore', () => {
  const data = ref<PaneData>(jsonCopy(tmplPaneData))

  const setData = (val: PaneData) => {
    data.value = val
  }

  const setEditorColData = (val: EditorColData) => {
    data.value.editorCol = val
  }

  const setListColData = (val: ListColData) => {
    data.value.listCol = val
  }

  const setNavigationColData = (val: NavigationColData) => {
    data.value.navigationCol = val
  }

  const resetEditorColData = () => {
    const paneDefault = jsonCopy(tmplPaneData) as PaneData
    data.value.editorCol = paneDefault.editorCol
  }

  return {
    data,
    setData,
    setEditorColData,
    setListColData,
    setNavigationColData,
    resetEditorColData
  }
})
