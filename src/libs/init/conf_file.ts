import type { Setting, SettingOfStartUp } from '@/types'
import { MasterPasswordSalt, ConfigStartUpPwd } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { useSettingStore } from '@/pinia/modules/settings'
import { getDataDirs } from '@/libs/init/dirs'
import { CmdInvoke } from '@/libs/commands'
import { i18n, setLocale } from '@/libs/init/i18n'
import { setTheme, genFilePwd } from '@/utils/utils'
import { getAvailableLocale } from '@/utils/locale'

export enum InitError {
  noConfFile,
  noSyncLockFileName
}

const genPwd = (pwdSha256: string) => genFilePwd(pwdSha256, MasterPasswordSalt)

export const initWithStartUpConfFile = async () => {
  const p = await getDataDirs()
  return CmdInvoke.decryptFileToString(ConfigStartUpPwd, p.pathOfConfigStartUp).then(async (data: string) => {
    if (data === '') {
      return false
    }

    const conf = JSON.parse(data as string) as SettingOfStartUp
    const settingStore = useSettingStore()
    const settings = settingStore.data

    // locale
    const locale = conf.appearance.locale
    if (locale) {
      setLocale(locale)
      settings.appearance.locale = locale
    }

    // Theme
    const appStore = useAppStore()
    const ad = appStore.data
    const themeName = conf.appearance.theme
    if (themeName !== '') {
      setTheme(themeName)
      ad.currentTheme = themeName
      settings.appearance.theme = themeName
    }

    await appStore.setData(ad)
    settingStore.setData(settings, false)
  })
}

export const saveStartUpConfFile = async () => {
  const settingStore = useSettingStore()
  const settings = settingStore.data
  const p = await getDataDirs()

  const content: SettingOfStartUp = {
    appearance: {
      locale: settings.appearance.locale,
      theme: settings.appearance.theme
    }
  }

  CmdInvoke.encryptStringToFile(ConfigStartUpPwd, p.pathOfConfigStartUp, JSON.stringify(content))
}

export const initWithConfFile = async (pwdSha256: string, successCallback: CallableFunction | null, failedCallback: (err: InitError) => unknown | null) => {
  const appStore = useAppStore()
  const settingStore = useSettingStore()

  const p = await getDataDirs()
  return CmdInvoke.decryptFileToString(genPwd(pwdSha256), p.pathOfConfig).then(async (data: string) => {
    if (data === '') {
      return false
    }

    const conf = JSON.parse(data as string) as Setting
    setLocale(getAvailableLocale(i18n.global.availableLocales, appStore.data.defaultLocale))

    // Verify the contents of the configuration file
    if (Object.keys(conf).length === 0) {
      // Set necessary properties
      const data = settingStore.data
      data.encryption.masterPassword = ''
      settingStore.setData(data, false)

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

    const locale = conf.appearance.locale
    if (locale) {
      setLocale(locale)
    }

    await settingStore.setData(conf, false)

    // Theme
    const ad = appStore.data
    const themeName = conf.appearance.theme
    if (themeName !== '') {
      setTheme(themeName)
      ad.currentTheme = themeName
    }

    await appStore.setData(ad)

    if (successCallback) {
      successCallback()
    }

    return true
  })
}

export const saveConfToFile = async () => {
  const settingStore = useSettingStore()
  const p = await getDataDirs()

  CmdInvoke.encryptStringToFile(genPwd(settingStore.data.encryption.masterPassword), p.pathOfConfig, JSON.stringify(settingStore.data))
}

export const checkConfFileExist = async () => {
  const appStore = useAppStore()
  const ad = appStore.data
  const p = await getDataDirs()
  CmdInvoke.existFile(p.pathOfConfig).then((exist: boolean) => {
    ad.existConfigFile = exist
    appStore.setData(ad)
  })
}
