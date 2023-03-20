import { ConfigFileName } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { useSettingStore } from '@/pinia/modules/settings'
import { CmdAdapter, CmdInvoke } from '@/libs/commands'
import { jsonCopy } from '@/utils/utils'

export const initCoreDirs = async () => {
  const appStore = useAppStore()

  const separator = await CmdAdapter.isWindows() ? '\\' : '/'
  const appCoreConf = await CmdInvoke.getAppCoreConf()

  const pathOfHome = appCoreConf.homeDir
  const pathOfAppData = appCoreConf.homeAppDir
  const pathOfConfig = `${pathOfAppData}${ConfigFileName}`

  // style
  const pathOfCustomStyle = `${pathOfAppData}${separator}style${separator}`
  const pathOfCustomBackgroundImage = `${pathOfCustomStyle}custom_background_image.jpg`

  const aaa = appStore.data
  aaa.appName = appCoreConf.appName
  aaa.defaultLocale = appCoreConf.defaultLanguage
  aaa.defaultLocaleInNative = appCoreConf.defaultLanguageInNative
  aaa.version = appCoreConf.version

  aaa.dataPath.pathOfHomeAppData = pathOfAppData
  aaa.dataPath.pathOfConfig = pathOfConfig
  aaa.dataPath.pathOfHome = pathOfHome
  aaa.dataPath.pathOfCustomStyle = pathOfCustomStyle
  aaa.dataPath.pathOfCustomBackgroundImage = pathOfCustomBackgroundImage
  appStore.setData(jsonCopy(aaa))
}

export const initWorkDirs = async () => {
  const appStore = useAppStore()
  const settingStore = useSettingStore()

  const separator = await CmdAdapter.isWindows() ? '\\' : '/'
  const settings = settingStore.data

  // workDir
  let workDir = settings.normal.workDir
  if (!workDir.endsWith(separator)) {
    workDir = workDir + separator
  }

  const pathOfCurrentDir = `${workDir}current${separator}`
  const pathOfSyncDir = `${workDir}sync${separator}`
  const pathOfSyncCachedDir = `${pathOfSyncDir}cache${separator}`
  const pathOfSyncDownloadDir = `${pathOfSyncDir}download${separator}`

  const aaa = appStore.data
  aaa.dataPath.pathOfCurrentDir = pathOfCurrentDir
  aaa.dataPath.pathOfSyncDir = pathOfSyncDir
  aaa.dataPath.pathOfSyncCachedDir = pathOfSyncCachedDir
  aaa.dataPath.pathOfSyncDownloadDir = pathOfSyncDownloadDir
  appStore.setData(jsonCopy(aaa))
}

export const pathJoin = async (dirs: string[]) => {
  const separator = await CmdAdapter.isWindows() ? '\\' : '/'
  return dirs.join(separator)
}
