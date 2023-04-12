import { ElMessageBox } from 'element-plus'

import { MessagesInfo } from '@/types'
import { TypeString } from '@/constants'
import { getDataDirs } from '@/libs/init/dirs'
import { useAppStore } from '@/pinia/modules/app'
import { genFilePwd } from '@/libs/commands'
import { invoker } from '@/libs/commands/invoke'
import { i18n } from '@/libs/init/i18n'

import { parseEntryFile } from './parser_decode'
import { addFileMeta, saveToEntryFile, writeUserData } from './utils'
import { tmplEntryFileData } from './types_template'

export const initEntryFile = async () => {
  const appStore = useAppStore()

  const settings = appStore.data.settings
  const encrytpSetting = settings.encryption
  const p = await getDataDirs()
  const dir = p.pathOfCurrentDir
  const entryFileName = encrytpSetting.entryFileName
  const path = dir + entryFileName

  return invoker.readUserDataFile(genFilePwd(''), path, true, TypeString, '', '').then((fileData) => {
    if (fileData.crc32 !== fileData.crc32_check) {
      const msg = MessagesInfo.FileVerificationFailed
      invoker.logError(msg + ` >>> crc32_check: ${fileData.crc32_check}, crc32: ${fileData.crc32}`)
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
    appStore.setUserData(ret.userData)

    if (import.meta.env.TAURI_DEBUG) {
      console.log('>>> Entry file data:: ', jsonStr)
      console.log('>>> Entry file data after parsed:: ', ret.userData)
    }
  })
}

export const saveDefaultEntryFile = async () => {
  const appStore = useAppStore()
  const fileName = appStore.data.settings.encryption.entryFileName
  const p = await getDataDirs()

  if (await writeUserData(p.pathOfCurrentDir + fileName, fileName, tmplEntryFileData())) {
    addFileMeta(p.pathOfCurrentDir, fileName).then((res) => {
      saveToEntryFile()
    })
  }
}
