import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { AppInfo } from '@/types'
import { tmplAppData } from '@/types_template'
import { getTimestampMilliseconds } from '@/utils/time'

export const useAppStore = defineStore('appStore', () => {
  const data = ref<AppInfo>(tmplAppData)

  const setData = (val: AppInfo) => {
    data.value = val
  }

  // For now, we only record notebook file, just record it when call saveNotebook(true) function.
  // const setFileMtimeUtc = (fileName: string) => {
  //   const f = data.value.fileMetaMapping[fileName] || {}
  //   f.mtimeUtc = getTimestampMilliseconds()
  //   data.value.fileMetaMapping[fileName] = f
  // }

  const setFileDtimeUtc = (fileName: string) => {
    const f = data.value.fileMetaMapping[fileName]
    f.dtimeUtc = getTimestampMilliseconds()
    data.value.fileMetaMapping[fileName] = f
  }

  const clearStorage = async () => {
    sessionStorage.clear()
    localStorage.clear()
  }

  return {
    data,
    setData,
    // setFileMtimeUtc,
    setFileDtimeUtc,
    clearStorage
  }
})
