import { homeDir } from '@tauri-apps/api/path'
import { AppName, ConfigFileName, DefaultFileNameRule } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { useSettingStore } from '@/pinia/modules/settings'
import { CmdAdapter, CmdInvoke } from '@/libs/commands'
import { genTimeHashedSign } from '@/utils/hash'

export const getHasdedSign = () => {
  const settingStore = useSettingStore()
  const settingData = settingStore.data
  return genTimeHashedSign(settingData.encryption.fileNameRule || DefaultFileNameRule, settingData.appearance.dateTimeFormat, settingData.encryption.fileExt)
}

export const initDataDirs = async () => {
  const appStore = useAppStore()
  const settingStore = useSettingStore()

  const separator = await CmdAdapter.isWindows() ? '\\' : '/'
  const pathOfhome = await homeDir()

  const settings = settingStore.data

  const pathOfAppData = `${pathOfhome}${separator}.${AppName}${separator}`
  const pathOfConfig = `${pathOfAppData}${ConfigFileName}`

  // sync
  const pathOfSyncDir = settings.normal.workDir + 'sync/'
  const pathOfSyncCachedDir = pathOfSyncDir + 'cache/'
  const pathOfSyncDownloadDir = pathOfSyncDir + 'download/'

  const aaa = appStore.data
  aaa.pathSeparator = separator
  aaa.dataPath = { pathOfhome, pathOfAppData, pathOfConfig, pathOfSyncDir, pathOfSyncCachedDir, pathOfSyncDownloadDir }
  appStore.setData(aaa)

  CmdInvoke.existFile(appStore.data.dataPath.pathOfConfig).then((exist: boolean) => {
    aaa.existConfigFile = exist
    appStore.setData(aaa)
  })
}

export const getDataDirs = () => {
  const appStore = useAppStore()
  return appStore.data.dataPath
}
