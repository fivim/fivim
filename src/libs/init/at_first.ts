import { AppMode } from '@/types'
import { useAppStore } from '@/pinia/modules/app'
import { useSettingStore } from '@/pinia/modules/settings'
import { CmdInvoke } from '@/libs/commands'
import { i18n } from '@/libs/init/i18n'
import { runInTauri } from '@/utils/utils'
import { initStyle } from '@/libs/init/styles'
import { initEntryFile } from '@/libs/user_data/entry_file'
import { isMobileScreen } from '@/utils/media_query'
import { initWithConfFile, InitError } from '@/libs/init/conf_file'

const initAppInfo = () => {
  const appStore = useAppStore()
  const appInfo = appStore.data
  if (runInTauri()) {
    appInfo.isWebPage = false
  } else {
    appInfo.isWebPage = true
  }

  if (isMobileScreen()) {
    appInfo.appMode = AppMode.Mobile
  } else {
    appInfo.appMode = AppMode.Desktop
  }

  appInfo.lockscreen = true
  appInfo.changeLocaleTimestamp = new Date().getTime()
  appStore.setData(appInfo) // save app data
  return appInfo
}

// Initialize other after configuration file initialization.
export const initAfterConfigFile = () => {
  // CmdInvoke.closeSplashscreen()// close splashscreen

  initAppInfo()
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

export const initAtFirst = (pwdSha256: string) => {
  return initWithConfFile(pwdSha256, initAfterConfigFile, failedCallback)
}
