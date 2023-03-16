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
import { getWorkDir } from './utils'

export const initEntryFile = async () => {
  const appStore = useAppStore()
  const paneDataStore = usePaneDataStore()
  const settingStore = useSettingStore()
  const settings = settingStore.data
  const encrytpSetting = settings.encryption

  CmdInvoke.readUserDataFile(settings.encryption.masterPassword, getWorkDir() + encrytpSetting.entryFileName, true).then((fileData: UserDataFile) => {
    if (fileData.file_data_str.length === 0) {
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

    const ret = parseEntryFile(JSON.parse(fileData.file_data_str)) // Remove escape of file_data_str
    paneDataStore.setData(jsonCopy(ret.paneData)) // ret is a Proxy

    const appData = appStore.data
    appData.fileMetaMapping = ret.fileMetaMapping
    appStore.setData(appData)
  })
}

export const saveDefaultEntryFile = () => {
  const settingStore = useSettingStore()
  const mp = settingStore.data.encryption.masterPassword
  const fileName = settingStore.data.encryption.entryFileName

  return CmdInvoke.writeUserDataFile(mp, getWorkDir() + fileName, fileName, stringToUint8Array(JSON.stringify(EmptyEntryFile)), '')
}
