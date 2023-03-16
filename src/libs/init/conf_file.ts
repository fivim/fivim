import type { Setting } from '@/types'
import { DefaultLanguage, MasterPasswordSalt } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { useSettingStore } from '@/pinia/modules/settings'
import { CmdInvoke } from '@/libs/commands'
import { i18n, setLocale } from '@/libs/init/i18n'
import { sha256 } from '@/utils/hash'
import { setTheme } from '@/utils/utils'
import { getAvailableLocale } from '@/utils/locale'

export enum InitError {
  noConfFile,
  noSyncLockFileName
}

// Make a password with other sign.
const confFilePwd = (pwdSha256: string) => {
  if (pwdSha256 === '') {
    return ''
  }

  return sha256(MasterPasswordSalt + MasterPasswordSalt + pwdSha256)
}

export const initWithConfFile = (pwdSha256: string, successCallback: CallableFunction | null, failedCallback: (err: InitError) => unknown | null) => {
  const appStore = useAppStore()
  const settingStore = useSettingStore()

  const p = appStore.data.dataPath
  return CmdInvoke.decryptFileToString(confFilePwd(pwdSha256), p.pathOfConfig).then((data: string) => {
    if (data === '') {
      return false
    }

    const conf: Setting = JSON.parse(data as string) as Setting
    setLocale(getAvailableLocale(i18n.global.availableLocales, DefaultLanguage))

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

    const locale = conf.normal.language
    if (locale) {
      setLocale(locale)
    }

    settingStore.setData(conf, false)

    // Theme
    const ast = appStore.data
    const themeName = conf.appearance.theme
    if (themeName !== '') {
      setTheme(themeName)
      ast.currentTheme = themeName
    }
    appStore.setData(ast)

    if (successCallback) {
      successCallback()
    }

    return true
  })
}

export const saveConfToFile = () => {
  const appStore = useAppStore()
  const settingStore = useSettingStore()
  const p = appStore.data.dataPath

  // save as toml format
  CmdInvoke.encryptStringToFile(confFilePwd(settingStore.data.encryption.masterPassword), p.pathOfConfig, JSON.stringify(settingStore.data))
}
