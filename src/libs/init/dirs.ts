import { ConfigFileName, ConfigStartUpFileName } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { useSettingStore } from '@/pinia/modules/settings'
import { CmdAdapter, CmdInvoke } from '@/libs/commands'
import { jsonCopy } from '@/utils/utils'

export const initCoreDirs = async () => {
  const separator = await CmdAdapter.isWindows() ? '\\' : '/'
  const appCoreConf = await CmdInvoke.getAppCoreConf()

  const appStore = useAppStore()
  const aaa = appStore.data

  const pathOfHome = appCoreConf.homeDir
  const pathOfAppData = appCoreConf.homeAppDir

  aaa.appName = appCoreConf.appName
  aaa.defaultLocale = appCoreConf.defaultLanguage
  aaa.defaultLocaleInNative = appCoreConf.defaultLanguageInNative
  aaa.version = appCoreConf.version

  aaa.dataPath.separator = separator
  aaa.dataPath.pathOfHomeAppData = pathOfAppData
  aaa.dataPath.pathOfHome = pathOfHome
  appStore.setData(jsonCopy(aaa))
}

export const pathJoin = async (dirs: string[]) => {
  const separator = await CmdAdapter.isWindows() ? '\\' : '/'
  return dirs.join(separator)
}

export const getDataDirs = async () => {
  const appStore = useAppStore()
  const dataPath = appStore.data.dataPath
  const separator = dataPath.separator
  const pathOfHomeAppData = dataPath.pathOfHomeAppData

  const settingStore = useSettingStore()
  const settings = settingStore.data
  const masterPassword = settingStore.data.encryption.masterPassword

  const pathOfCustomStyle = `${pathOfHomeAppData}${separator}style${separator}`
  // Encrypt dir name, use flat directory structure
  const currentDir = await CmdInvoke.stringCrc32(masterPassword + '#current')
  const syncDir = await CmdInvoke.stringCrc32(masterPassword + '#sync')
  const syncCacheDir = await CmdInvoke.stringCrc32(masterPassword + '#sync/cache')
  const syncDownloadDir = await CmdInvoke.stringCrc32(masterPassword + '#sync/download')

  // workDir
  let workDir = settings.normal.workDir
  if (!workDir.endsWith(separator)) {
    workDir = workDir + separator
  }

  return {
    pathOfHome: dataPath.pathOfHome,
    pathOfHomeAppData,
    pathOfConfig: `${pathOfHomeAppData}${ConfigFileName}`,
    pathOfConfigStartUp: `${pathOfHomeAppData}${ConfigStartUpFileName}`,
    pathOfCurrentDir: `${workDir}${currentDir}${separator}`,
    pathOfSyncDir: `${workDir}${syncDir}${separator}`,
    pathOfSyncCachedDir: `${workDir}${syncCacheDir}${separator}`,
    pathOfSyncDownloadDir: `${workDir}${syncDownloadDir}${separator}`,
    // style
    pathOfCustomStyle,
    pathOfCustomBackgroundImage: `${pathOfCustomStyle}custom_background_image.jpg`
  }
}
