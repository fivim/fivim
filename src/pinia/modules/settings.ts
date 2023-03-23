import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { Setting } from '@/types'
import { tmplSettingData } from '@/types_template'
import { MasterPasswordMinLength, MasterPasswordMaxLength } from '@/constants'
import { saveConfToFile, saveStartUpConfFile } from '@/libs/init/conf_file'
import { CmdAdapter } from '@/libs/commands'
import { jsonCopy } from '@/utils/utils'

export const useSettingStore = defineStore('settingStore', () => {
  const data = ref<Setting>(jsonCopy(tmplSettingData))

  // set data and save config file
  const setData = async (val: Setting, writeToConfigFile: boolean) => {
    // Ensure that the local directory path ends with a slash
    const separator = await CmdAdapter.isWindows() ? '\\' : '/'

    const workDir = val.normal.workDir
    if (workDir !== '' && !workDir.endsWith(separator)) {
      val.normal.workDir = workDir + separator
    }

    data.value = val

    if (writeToConfigFile) {
      saveConfToFile()
      saveStartUpConfFile()
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
