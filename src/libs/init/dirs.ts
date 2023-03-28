import { ExtDataPathInfo } from '@/types'
import { ConfigFileName, ConfigStartUpFileName } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { CmdAdapter } from '@/libs/commands'
import { invoker } from '@/libs/commands/invoke'
import { jsonCopy } from '@/utils/utils'

export const initCoreDirs = async () => {
  const separator = await CmdAdapter().isWindows() ? '\\' : '/'
  const appCoreConf = await invoker.getAppCoreConf()

  const appStore = useAppStore()
  const ad = appStore.data

  const pathOfHome = appCoreConf.homeDir
  const pathOfAppData = appCoreConf.homeAppDir

  ad.appName = appCoreConf.appName
  ad.defaultLocale = appCoreConf.defaultLanguage
  ad.defaultLocaleInNative = appCoreConf.defaultLanguageInNative
  ad.version = appCoreConf.version

  ad.dataPath.separator = separator
  ad.dataPath.pathOfHomeAppData = pathOfAppData
  ad.dataPath.pathOfHome = pathOfHome
  appStore.setData(jsonCopy(ad))
}

export const getDataDirs = async () => {
  const appStore = useAppStore()
  const dataPath = appStore.data.dataPath
  const separator = dataPath.separator
  const pathOfHomeAppData = dataPath.pathOfHomeAppData

  const settings = appStore.data.settings
  const masterPassword = appStore.data.settings.encryption.masterPassword

  const pathOfCustomStyle = `${pathOfHomeAppData}${separator}style${separator}`
  // Encrypt dir name, use flat directory structure
  const currentDir = await invoker.stringCrc32(masterPassword + '#current')
  const syncDir = await invoker.stringCrc32(masterPassword + '#sync')
  const syncCacheDir = await invoker.stringCrc32(masterPassword + '#sync/cache')
  const syncDownloadDir = await invoker.stringCrc32(masterPassword + '#sync/download')

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
  } as ExtDataPathInfo
}
