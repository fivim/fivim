import { AppMode } from '@/types'
import { StorageType } from '@/libs/sync/types'
import { useAppStore } from '@/pinia/modules/app'
import { useSettingStore } from '@/pinia/modules/settings'
import { CmdInvoke } from '@/libs/commands'
import { i18n } from '@/libs/init/i18n'
import { initWithConfFile, InitError } from '@/libs/init/conf_file'
import { initCoreDirs, initWorkDirs } from '@/libs/init/dirs'
import { runInTauri } from '@/utils/utils'
import { initStyle } from '@/libs/init/styles'
import { initEntryFile } from '@/libs/user_data/entry_file'
import { initSyncAdapter } from '@/libs/sync'
import { isMobileScreen } from '@/utils/media_query'

const initAppData = () => {
  const appStore = useAppStore()
  const appData = appStore.data
  if (runInTauri()) {
    appData.isWebPage = false
  } else {
    appData.isWebPage = true
  }

  if (isMobileScreen()) {
    appData.appMode = AppMode.Mobile
  } else {
    appData.appMode = AppMode.Desktop
  }

  appData.changeLocaleTimestamp = new Date().getTime()
  appStore.setData(appData) // save app data
  return appData
}

export const initSync = () => {
  const appStore = useAppStore()
  const settingStore = useSettingStore()
  const syncSetting = settingStore.data.sync
  const p = appStore.data.dataPath
  // Sync to the storage which user set
  // init sync adapter
  switch (syncSetting.storageType) {
    case StorageType.aliyunOss:
      initSyncAdapter.aliyunOss(syncSetting.aliyunOss)
      break
    case StorageType.amazonS3:
      initSyncAdapter.amazonS3(syncSetting.amazonS3)
      break
    case StorageType.localDisk:
      initSyncAdapter.localDisk({
        localDirPath: p.pathOfSyncCachedDir,
        remoteDirPath: syncSetting.localDisk.remoteDirPath
      })
      break
    default:
      // TODO: If not set, alert user to set
      break
  }

  // TODO: check SyncAdapter if it is inited
}

// Initialize other after configuration file initialization.
export const initAfterConfigFile = async () => {
  // CmdInvoke.closeSplashscreen()// close splashscreen

  await initWorkDirs()
  initAppData()
  initSync()
  initStyle()
  initEntryFile()
}

const failedCallback = (err: InitError) => {
  const t = i18n.global.t
  switch (err) {
    case InitError.noConfFile:
      console.log('initialization error: cannot find the configuration file.')
      CmdInvoke.notification(t('initialization error'), t('&cannot find conf file'), '')
      break
    case InitError.noSyncLockFileName:
      console.log('initialization error: &cannot find sync lock file')
      CmdInvoke.notification(t('initialization error'), t('&cannot find sync lock file'), '')
      break
  }
}

export const initAtFirst = async (pwdSha256: string) => {
  await initCoreDirs()
  return await initWithConfFile(pwdSha256, initAfterConfigFile, failedCallback)
}
