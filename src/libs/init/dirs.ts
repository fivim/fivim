import { ExtDataPathInfo } from '@/types'
import { tmplExtDataPathInfo } from '@/types_template'
import { ConfigFileName, ConfigStartUpFileName } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { CmdAdapter } from '@/libs/commands'
import { invoker } from '@/libs/commands/invoke'

export const initCoreDirs = async () => {
  const separator = await CmdAdapter().isWindows() ? '\\' : '/'
  const appCoreConf = await invoker.getAppCoreConf()

  const appStore = useAppStore()
  const ad = appStore.data

  ad.appName = appCoreConf.appName
  ad.appRepo = appCoreConf.repo
  ad.defaultLocale = appCoreConf.defaultLanguage
  ad.defaultLocaleInNative = appCoreConf.defaultLanguageInNative
  ad.version = appCoreConf.version

  ad.dataPath.separator = separator
  ad.dataPath.pathOfHomeAppData = appCoreConf.homeAppDir
  ad.dataPath.pathOfHome = appCoreConf.homeDir
  ad.dataPath.pathOfLogFile = appCoreConf.logFilePath
  appStore.setData(ad)
}

export const getDataDirsByPwd = async (masterPassword: string) => {
  const appStore = useAppStore()
  const dataPath = appStore.data.dataPath
  const separator = dataPath.separator
  const pathOfHomeAppData = dataPath.pathOfHomeAppData

  const settings = appStore.data.settings

  // Encrypt dir name, use flat directory structure
  const changeMasterPasswordDir = await invoker.stringCrc32(masterPassword + '#changeMasterPassword')
  const currentDir = await invoker.stringCrc32(masterPassword + '#current')
  const syncDir = await invoker.stringCrc32(masterPassword + '#sync')
  const syncCacheDir = await invoker.stringCrc32(masterPassword + '#sync/cache')
  const syncDownloadDir = await invoker.stringCrc32(masterPassword + '#sync/download')

  // workDir
  let workDir = settings.normal.workDir
  if (!workDir.endsWith(separator)) {
    workDir = workDir + separator
  }

  const pathOfCustomStyle = `${pathOfHomeAppData}${separator}style${separator}`
  const res: ExtDataPathInfo = {
    pathOfHome: dataPath.pathOfHome,
    pathOfHomeAppData,
    pathOfConfig: `${pathOfHomeAppData}${ConfigFileName}`,
    pathOfConfigStartUp: `${pathOfHomeAppData}${ConfigStartUpFileName}`,
    pathOfChangeMasterPasswordDir: `${workDir}${changeMasterPasswordDir}${separator}`,
    pathOfCurrentDir: `${workDir}${currentDir}${separator}`,
    pathOfSyncDir: `${workDir}${syncDir}${separator}`,
    pathOfSyncCachedDir: `${workDir}${syncCacheDir}${separator}`,
    pathOfSyncDownloadDir: `${workDir}${syncDownloadDir}${separator}`,
    // style
    pathOfCustomStyle,
    pathOfCustomBackgroundImage: `${pathOfCustomStyle}custom_background_image.jpg`
  }

  return res
}

let dataDirsCache: ExtDataPathInfo = tmplExtDataPathInfo()

export const getDataDirs = async () => {
  const appStore = useAppStore()
  // TODO might have bug.
  // if (appStore.data.settings.normal.workDir && dataDirsCache.pathOfCurrentDir !== '') {
  //   return dataDirsCache
  // }

  const masterPassword = appStore.data.settings.encryption.masterPassword

  dataDirsCache = await getDataDirsByPwd(masterPassword)
  return dataDirsCache
}
