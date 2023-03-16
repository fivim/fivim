import { ElMessageBox } from 'element-plus'

import { useAppStore } from '@/pinia/modules/app'
import { usePaneDataStore } from '@/pinia/modules/pane_data'
import { useSettingStore } from '@/pinia/modules/settings'

import { EmptyEntryFile } from '@/types_template'
import { CmdInvoke } from '@/libs/commands'
import { UserDataFile } from '@/libs/commands/types'
import { i18n } from '@/libs/init/i18n'
import { stringToUint8Array } from '@/utils/string'
import { jsonCopy } from '@/utils/utils'
import { parseEntryFile } from './parser_decode'

export const initEntryFile = async () => {
  const appStore = useAppStore()
  const paneDataStore = usePaneDataStore()
  const settingStore = useSettingStore()
  const appData = appStore.data
  const settings = settingStore.data
  const encrytpSetting = settings.encryption
  const p = appData.dataPath
  const dir = p.pathOfCurrentDir
  const entryFileName = encrytpSetting.entryFileName
  const path = dir + entryFileName

  CmdInvoke.readUserDataFile(settings.encryption.masterPassword, path, true).then((fileData: UserDataFile) => {
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

    const ret = parseEntryFile(JSON.parse(jsonStr)) // Remove escape of file_data_str
    paneDataStore.setData(jsonCopy(ret.paneData)) // ret is a Proxy

    const appData = appStore.data
    appData.fileMetaMapping = ret.fileMetaMapping
    appStore.setData(appData)
  })
}

export const saveDefaultEntryFile = () => {
  const appStore = useAppStore()
  const settingStore = useSettingStore()
  const mp = settingStore.data.encryption.masterPassword
  const fileName = settingStore.data.encryption.entryFileName
  const p = appStore.data.dataPath

  return CmdInvoke.writeUserDataFile(mp, p.pathOfCurrentDir + fileName, fileName, stringToUint8Array(JSON.stringify(EmptyEntryFile)), '')
}
