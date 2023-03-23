import { ElMessageBox } from 'element-plus'

import { ErrorMessages } from '@/types'
import { getDataDirs } from '@/libs/init/dirs'
import { useAppStore } from '@/pinia/modules/app'
import { usePaneDataStore } from '@/pinia/modules/pane_data'
import { useSettingStore } from '@/pinia/modules/settings'

import { tmplEntryFileData } from '@/types_template'
import { CmdInvoke } from '@/libs/commands'
import { UserDataFile } from '@/libs/commands/types'
import { i18n } from '@/libs/init/i18n'
import { stringToUint8Array } from '@/utils/string'

import { parseEntryFile } from './parser_decode'
import { writeUserData } from './utils'

export const initEntryFile = async () => {
  const appStore = useAppStore()
  const paneDataStore = usePaneDataStore()
  const settingStore = useSettingStore()

  const settings = settingStore.data
  const encrytpSetting = settings.encryption
  const p = await getDataDirs()
  const dir = p.pathOfCurrentDir
  const entryFileName = encrytpSetting.entryFileName
  const path = dir + entryFileName

  return CmdInvoke.readUserDataFile(settings.encryption.masterPassword, path, true).then((fileData: UserDataFile) => {
    if (fileData.crc32 !== fileData.crc32_check) {
      const msg = ErrorMessages.FileVerificationFailed
      CmdInvoke.logError(msg + ` >>> crc32_check: ${fileData.crc32_check}, crc32: ${fileData.crc32}`)
      // return Promise.reject(new Error(msg))
    }

    const jsonStr = fileData.file_data_str
    if (jsonStr.length === 0) {
      const t = i18n.global.t
      ElMessageBox.confirm(
        t('&Entry file reinitialize tip'),
        t('Warning'),
        {
          confirmButtonText: t('OK'),
          cancelButtonText: t('Cancel'),
          type: 'warning'
        }
      )
        .then(() => {
          saveDefaultEntryFile()
        })
        .catch(() => {
          //
        })

      return
    }

    const ret = parseEntryFile(jsonStr)
    paneDataStore.setData(ret.paneData)

    if (import.meta.env.TAURI_DEBUG) {
      console.log('>>> Entry file data:: ', jsonStr)
      console.log('>>> Entry file data after parsed:: ', ret.paneData)
    }

    const appData = appStore.data
    appData.fileMetaMapping = ret.fileMetaMapping
    appStore.setData(appData)
  })
}

export const saveDefaultEntryFile = async () => {
  const settingStore = useSettingStore()
  const fileName = settingStore.data.encryption.entryFileName
  const p = await getDataDirs()

  writeUserData(p.pathOfCurrentDir + fileName, fileName, stringToUint8Array(JSON.stringify(tmplEntryFileData)))
}
