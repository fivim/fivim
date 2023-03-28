import type { SettingOfStartUpInfo, SettingInfo } from '@/types'
import { MasterPasswordSalt, ConfigStartUpPwd } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { getDataDirs } from '@/libs/init/dirs'
import { invoker } from '@/libs/commands/invoke'
import { i18n, setLocale } from '@/libs/init/i18n'
import { setTheme, genFilePwdWithSalt } from '@/utils/utils'
import { getAvailableLocale } from '@/utils/locale'

export enum InitError {
  noConfFile,
  noSyncLockFileName
}

const genPwd = (pwdSha256: string) => genFilePwdWithSalt(pwdSha256, MasterPasswordSalt)

export const initWithStartUpConfFile = async () => {
  const p = await getDataDirs()
  return invoker.decryptFileToString(ConfigStartUpPwd, p.pathOfConfigStartUp).then(async (data: string) => {
    if (data === '') {
      return false
    }

    const conf = JSON.parse(data as string) as SettingOfStartUpInfo
    const appStore = useAppStore()
    const settings = appStore.data.settings

    // locale
    const locale = conf.appearance.locale
    if (locale) {
      setLocale(locale)
      settings.appearance.locale = locale
    }

    // Theme
    const ad = appStore.data
    const themeName = conf.appearance.theme
    if (themeName !== '') {
      setTheme(themeName)
      ad.currentTheme = themeName
      settings.appearance.theme = themeName
    }

    appStore.setData(ad)
    appStore.setSettingData(settings, false)
  })
}

export const saveStartUpConfFile = async () => {
  const appStore = useAppStore()
  const settings = appStore.data.settings
  const p = await getDataDirs()

  const content: SettingOfStartUpInfo = {
    appearance: {
      locale: settings.appearance.locale,
      theme: settings.appearance.theme
    }
  }

  invoker.encryptObjectToFile(ConfigStartUpPwd, p.pathOfConfigStartUp, content)
}

export const initWithConfFile = async (pwdSha256: string, successCallback: CallableFunction | null, failedCallback: (err: InitError) => unknown | null) => {
  const p = await getDataDirs()
  return invoker.decryptFileToString(genPwd(pwdSha256), p.pathOfConfig).then(async (data: string) => {
    if (data === '') {
      return false
    }

    const appStore = useAppStore()
    const ad = appStore.data
    const settings = ad.settings
    const conf = JSON.parse(data as string) as SettingInfo

    setLocale(getAvailableLocale(i18n.global.availableLocales, ad.defaultLocale))

    // Verify the contents of the configuration file
    if (Object.keys(conf).length === 0) {
      // Set necessary properties
      settings.encryption.masterPassword = ''
      appStore.setSettingData(settings, false)

      if (failedCallback) {
        failedCallback(InitError.noConfFile)
      }
      return false
    }

    if (!conf.encryption.syncLockFileName) {
      if (failedCallback) {
        failedCallback(InitError.noSyncLockFileName)
      }
      return false
    }

    const setSuccess = await appStore.setSettingData(conf, false)
    if (setSuccess && successCallback) {
      successCallback()
    }

    return true
  })
}

export const saveConfToFile = async () => {
  const appStore = useAppStore()
  const settings = appStore.data.settings
  const p = await getDataDirs()

  const pwdSha256 = settings.encryption.masterPassword

  invoker.encryptObjectToFile(genPwd(pwdSha256), p.pathOfConfig, settings)
}

export const checkConfFileExist = async () => {
  const appStore = useAppStore()
  const p = await getDataDirs()
  invoker.existFile(p.pathOfConfig).then((exist: boolean) => {
    const ad = appStore.data
    ad.existConfigFile = exist
    appStore.setData(ad)
  })
}
