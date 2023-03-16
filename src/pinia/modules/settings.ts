import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { Setting } from '@/types'
import { EmptySetting } from '@/types_template'
import { MasterPasswordMinLength, MasterPasswordMaxLength } from '@/constants'
import { saveConfToFile } from '@/libs/init/conf_file'
import { CmdAdapter } from '@/libs/commands'

export const useSettingStore = defineStore('settingStore', () => {
  const data = ref<Setting>(EmptySetting)

  // set data and save config file
  const setData = async (val: Setting, writeTofile: boolean) => {
    // Ensure that the local directory path ends with a slash
    const separator = await CmdAdapter.isWindows() ? '\\' : '/'

    const remoteDirPath = val.sync.localDisk.remoteDirPath
    if (remoteDirPath !== '' && !remoteDirPath.endsWith(separator)) {
      val.sync.localDisk.remoteDirPath = remoteDirPath + separator
    }

    const workDir = val.normal.workDir
    if (workDir !== '' && !workDir.endsWith(separator)) {
      val.normal.workDir = workDir + separator
    }

    data.value = val

    if (writeTofile) {
      saveConfToFile()
    }
  }

  // Check the length of the master password.
  const checkMasterPasswordLength = (masterPassword: string) => {
    return masterPassword.length >= MasterPasswordMinLength && masterPassword.length <= MasterPasswordMaxLength
  }

  return {
    data,
    setData,
    checkMasterPasswordLength
  }
})
