import { defineStore } from 'pinia'
import { ref } from 'vue'

import { MasterPasswordMinLength, MasterPasswordMaxLength } from '@/constants'
import type { AppInfo, SettingInfo } from '@/types'
import { tmplAppData } from '@/types_template'
import { CmdAdapter } from '@/libs/commands'
import { ListColInfo, CurrentFileInfo } from '@/components/pane/types'
import { saveConfToFile, saveStartUpConfFile } from '@/libs/init/conf_file'
import { UserDataInfo } from '@/libs/user_data/types'

export const useAppStore = defineStore('appStore', () => {
  const data = ref<AppInfo>(tmplAppData())

  const setData = (val: AppInfo) => {
    data.value = val
  }

  const setCurrentFile = (val: CurrentFileInfo) => {
    data.value.currentFile = val
  }

  const setListColData = (val: ListColInfo) => {
    data.value.listCol = val
  }

  // set data and save config file
  const setSettingData = async (val: SettingInfo, writeToConfigFile: boolean) => {
    // Ensure that the local directory path ends with a slash
    const separator = await CmdAdapter().isWindows() ? '\\' : '/'

    const workDir = val.normal.workDir
    if (workDir !== '' && !workDir.endsWith(separator)) {
      val.normal.workDir = workDir + separator
    }

    data.value.settings = val

    if (writeToConfigFile) {
      saveConfToFile()
      saveStartUpConfFile()
    }

    return true
  }

  const setUserData = (val: UserDataInfo) => {
    data.value.userData = val
  }

  // Check the length of the master password.
  const checkMasterPasswordLength = (masterPassword: string) => {
    return masterPassword.length >= MasterPasswordMinLength && masterPassword.length <= MasterPasswordMaxLength
  }

  const clearStorage = async () => {
    sessionStorage.clear()
    localStorage.clear()
  }

  return {
    data,
    checkMasterPasswordLength,
    clearStorage,
    setCurrentFile,
    setData,
    setListColData,
    setSettingData,
    setUserData
  }
})
