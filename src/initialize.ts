import { CONFIG_FILE_NAME, CONFIG_START_UP_FILE_NAME } from '@/constants'
import i18n from '@/i18n'
import { invoker } from '@/invoker'
import globalStore from '@/stores/globalStore'
import passwordStore from '@/stores/passwordStore'
import settingStore from '@/stores/settingStore'
import type { Setting, SettingOfStartUp } from '@/types'
import { tmplSettinggStartup } from '@/types_template'
import { iso8601StrToDateTime } from '@/utils/time'
import { genPwdArr, setDarkMode, setTheme } from '@/utils/utils'

const t = i18n.t

export const initCoreConf = async () => {
	const af = await invoker.getAppCoreConf()

	if (af === null) {
		invoker.showMessage(
			t('Error'),
			t('Unable to obtain core configuration information, please check the running environment'),
			'error',
			true,
		)
	}

	let homeDir = af.homeDir
	if (!homeDir.endsWith(af.pathSeparator)) homeDir = homeDir + af.pathSeparator

	let userFilesDirDefult = af.userFilesDirDefult
	if (!userFilesDirDefult.endsWith(af.pathSeparator)) userFilesDirDefult = userFilesDirDefult + af.pathSeparator

	globalStore.setPathOfConfDir(`${af.homeDir}${af.pathSeparator}conf${af.pathSeparator}`)
	globalStore.setPathOfHome(homeDir)
	globalStore.setPathOfLogFile(af.logFilePath)
	globalStore.setPathOfUserFilesDefult(af.userFilesDirDefult)
	globalStore.setPathSeparator(af.pathSeparator)

	return true
}

export const getDataDirs = async () => {
	const separator = globalStore.data.pathSeparator
	let pathOfConfDir = globalStore.data.pathOfConfDir
	if (!pathOfConfDir.endsWith(separator)) pathOfConfDir = pathOfConfDir + separator

	return {
		pathOfConfDir: pathOfConfDir,
		pathOfConfFile: `${pathOfConfDir}${CONFIG_FILE_NAME}`,
		pathOfConfigStartUp: `${pathOfConfDir}${CONFIG_START_UP_FILE_NAME}`,
	}
}

export const initStartUpConfFile = async () => {
	const p = await getDataDirs()
	const str = await invoker.readFileToString(p.pathOfConfigStartUp)

	if (str === '') return false

	const conf = JSON.parse(str as string) as SettingOfStartUp

	// locale
	const locale = conf.locale
	if (locale) settingStore.setLocale(locale)

	// Theme
	let themeName = conf.theme
	if (themeName === '') themeName = 'defalut'
	setTheme(themeName)
	settingStore.setTheme(themeName)

	if (conf.forceDarkMode) setDarkMode()

	return true
}

export const initConfFile = async (pwdVec: number[]) => {
	const p = await getDataDirs()
	const data = await invoker.decryptFileToString(genPwdArr(pwdVec), p.pathOfConfFile)

	if (data === '') {
		return false
	} else if (data === null) {
		console.error('Configuration file is null')
	}

	const conf = JSON.parse(data as string) as Setting

	// Convert lastSyncTime, the string in configuration file like "2024-01-15T13:13:34.265+08:00".
	const modes = conf.sync.conf
	conf.sync.conf.gitlabApi.lastSyncTime = iso8601StrToDateTime(modes.gitlabApi.lastSyncTime as unknown as string)

	// Verify the contents of the configuration file
	if (Object.keys(conf).length === 0) return true

	setTheme(conf.theme)
	settingStore.setData(conf)

	return true
}

export const saveConfToFile = async () => {
	const SD = settingStore.getData()
	const p = await getDataDirs()

	const wr = await invoker.encryptStringToFile(passwordStore.getData(), p.pathOfConfFile, JSON.stringify(SD))

	const content: SettingOfStartUp = tmplSettinggStartup()
	content.forceDarkMode = SD.forceDarkMode
	content.locale = SD.locale
	content.theme = SD.theme
	invoker.writeStringIntoFile(p.pathOfConfigStartUp, JSON.stringify(content))
}

export const deleteConfFile = async () => {
	const p = await getDataDirs()
	await invoker.deleteFile(p.pathOfConfFile)
	await invoker.deleteFile(p.pathOfConfigStartUp)

	return true
}

export const checkConfFileExist = async () => {
	const p = await getDataDirs()
	const exist = await invoker.existFile(p.pathOfConfFile)

	globalStore.setExistConfigFile(exist)

	return true
}

export const tryToInitConfFileByPwd = async (pwdVec: number[]) => {
	const icf = await initConfFile(pwdVec)

	return icf
}
