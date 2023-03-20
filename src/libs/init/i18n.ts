import { createI18n } from 'vue-i18n'

import { TextDirection } from '@/types'
import { settingOptions } from '@/conf'
import { getOsLocale } from '@/utils/locale'
import { InitCommandsAdapter, CmdInvoke } from '@/libs/commands'
import { useAppStore } from '@/pinia/modules/app'

type Dict = { [key: string]: string }

type LangPackMeta = {
  name: string,
  nativeName: string
  direction: TextDirection
}

type LangPackJson = {
  [key: string]: string
};

type LangPackItem = {
  meta: LangPackMeta,
  dict: Dict
};

type LangDict = {
  [key: string]: Dict
}

InitCommandsAdapter()

const languageMeta: { [key: string]: LangPackMeta } = {}

const getDictJson = async () => {
  const data = await CmdInvoke.getDictJson()
  return data
}

// Get LangPack from backend and convert to LangDict used in frontend
const getDict = async () => {
  const langPackJson = await getDictJson()
  const langPack: LangPackJson = JSON.parse(langPackJson)
  const dict: LangDict = {}

  // Loop the language pack to get the name and dictionary
  for (const key in langPack) {
    if (Object.prototype.hasOwnProperty.call(langPack, key)) {
      const pack = JSON.parse(langPack[key]) as LangPackItem

      settingOptions.language.push({
        value: key,
        label: pack.meta.name
      })

      dict[key] = pack.dict
      languageMeta[key] = pack.meta
    }
  }

  return dict
}

const getLoclae = async () => {
  let data = await CmdInvoke.getLocale()
  if (!data) {
    data = getOsLocale(getDefaultLoclae())
    CmdInvoke.setLocale(data)
  }
  return data
}

const getDefaultLoclae = () => {
  const appStore = useAppStore()
  return appStore.data.defaultLocale
}

const dict = await getDict()
const loclae = await getLoclae()

export const i18n = createI18n({
  locale: loclae || getDefaultLoclae(),
  messages: dict,
  legacy: false// Otherwise, there will cause "SyntaxError: Not available in legacy mode"
})

export const getLanguageMeta = (lang: string) => {
  return languageMeta[lang]
}

// Change locale, and do something else
// DO NOT USE `i18n.global.locale.value` ONLY
export const setLocale = (locale: string) => {
  const appStore = useAppStore()

  for (const key in dict) {
    if (Object.prototype.hasOwnProperty.call(dict, key)) {
      if (locale === key) {
        const textDirection = getLanguageMeta(locale).direction
        appStore.data.textDirection = textDirection

        i18n.global.locale.value = locale
        CmdInvoke.setLocale(locale)
        break
      }
    }
  }
}

export const currentLocaleDirection = (): TextDirection => {
  if (dict) {
    for (const key in dict) {
      if (Object.prototype.hasOwnProperty.call(dict, key)) {
        if (key === i18n.global.locale.value) {
          return getLanguageMeta(key).direction
        }
      }
    }
  }

  return 'LTR'
}
