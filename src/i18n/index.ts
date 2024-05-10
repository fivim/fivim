import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import { OptionItem } from '@/types'

import enDict from './en.json'
import zh_CNDict from './zh_CN.json'

export const languagesOptions: OptionItem[] = [
	{
		value: 'en',
		label: 'Engilsh',
	},
	{
		value: 'zh_CN',
		label: '简体中文(Chinese simplified)',
	},
]

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		// we init with resources
		resources: {
			en: {
				translations: enDict,
			},
			zh_CN: {
				translations: zh_CNDict,
			},
		},
		fallbackLng: 'en',
		debug: true,

		// have a common namespace used around the full app
		ns: ['translations'],
		defaultNS: 'translations',

		keySeparator: false, // we use content as keys

		interpolation: {
			escapeValue: false,
		},
	})

export default i18n

export const t = i18n.t
