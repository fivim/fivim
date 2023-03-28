import { AppModeInfo } from '@/types'
import { useAppStore } from '@/pinia/modules/app'
import { CmdAdapter } from '@/libs/commands'
import { invoker } from '@/libs/commands/invoke'
import { i18n } from '@/libs/init/i18n'
import { initWithConfFile, InitError } from '@/libs/init/conf_file'
import { initCoreDirs, getDataDirs } from '@/libs/init/dirs'
import { runInTauri } from '@/utils/utils'
import { initStyle } from '@/libs/init/styles'
import { isMobileScreen } from '@/utils/media_query'

const initAppData = () => {
  const appStore = useAppStore()
  const ad = appStore.data
  if (runInTauri()) {
    ad.isWebPage = false
  } else {
    ad.isWebPage = true
  }

  if (isMobileScreen()) {
    ad.appMode = AppModeInfo.Mobile
  } else {
    ad.appMode = AppModeInfo.Desktop
  }

  ad.changeLocaleTimestamp = new Date().getTime()
  appStore.setData(ad) // save app data
  return ad
}

// Initialize other after configuration file initialization.
export const initSuccessCallback = async () => {
  // invoker.closeSplashscreen()// close splashscreen

  initAppData()
  initStyle()
}

const initFailedCallback = (err: InitError) => {
  const t = i18n.global.t
  switch (err) {
    case InitError.noConfFile:
      invoker.logError('initialization error: cannot find the configuration file.')
      CmdAdapter().notification(t('initialization error'), t('&cannot find conf file'), '')
      break
    case InitError.noSyncLockFileName:
      invoker.logError('initialization error: &cannot find sync lock file')
      CmdAdapter().notification(t('initialization error'), t('&cannot find sync lock file'), '')
      break
  }
}

export const initAtFirst = async (pwdSha256: string, hasConfigFile: boolean) => {
  await initCoreDirs()
  if (hasConfigFile) {
    return await initWithConfFile(pwdSha256, initSuccessCallback, initFailedCallback)
  }

  return initSuccessCallback()
}
