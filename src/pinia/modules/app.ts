import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { AppInfo } from '@/types'
import { tmplAppData } from '@/types_template'
import { jsonCopy } from '@/utils/utils'

export const useAppStore = defineStore('appStore', () => {
  const data = ref<AppInfo>(jsonCopy(tmplAppData))

  const setData = (val: AppInfo) => {
    data.value = val
  }

  const clearStorage = async () => {
    sessionStorage.clear()
    localStorage.clear()
  }

  return {
    data,
    setData,
    clearStorage
  }
})
