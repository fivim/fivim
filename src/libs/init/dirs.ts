import { homeDir } from '@tauri-apps/api/path'
import { AppName, ConfigFileName } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { useSettingStore } from '@/pinia/modules/settings'
import { CmdAdapter } from '@/libs/commands'
import { jsonCopy } from '@/utils/utils'

export const initCoreDirs = async () => {
  const appStore = useAppStore()

  const separator = await CmdAdapter.isWindows() ? '\\' : '/'
  const pathOfHome = await homeDir()

  const pathOfAppData = `${pathOfHome}${separator}.${AppName}${separator}`
  const pathOfConfig = `${pathOfAppData}${ConfigFileName}`

  // style
  const pathOfCustomStyle = `${pathOfAppData}${separator}style${separator}`
  const pathOfCustomBackgroundImage = `${pathOfCustomStyle}custom_background_image.jpg`

  const aaa = appStore.data
  aaa.pathSeparator = separator
  aaa.dataPath.pathOfAppData = pathOfAppData
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
  aaa.pathSeparator = separator
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
