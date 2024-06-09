import { DateTime } from 'luxon'

import { AlertDialogProps } from '@/components/AlertDialog'
import { MessageLineProps } from '@/components/MessageLine'
import { TAB_FILE_TREE, TYPE_NONE } from '@/constants'
import i18n from '@/i18n'
import { Global, Setting, SettingOfStartUp } from '@/types'

const t = i18n.t
export const tmplSetting = (): Setting => {
	return {
		dateTimeFormat: '',
		encryptedFileExt: 'enc',
		forceDarkMode: false,
		passwordSum: '',
		locale: '',
		sync: {
			mode: TYPE_NONE,
			conf: {
				gitlabApi: {
					lastSyncTime: DateTime.fromMillis(0),
					lastCommitId: '',
					siteUrl: '',
					token: '',
					projectId: '',
					branch: '',
				},
				giteeApi: {
					lastSyncTime: DateTime.fromMillis(0),
					lastCommitId: '',
					owner: '',
					repo: '',
					branch: '',
					token: '',
				},
			},
		},
		theme: '',
		userFilesDir: '',
	}
}

export const tmplSettinggStartup = (): SettingOfStartUp => {
	return {
		forceDarkMode: false,
		locale: '',
		theme: '',
	}
}

export const tmplAlertDialogProps = (): AlertDialogProps => {
	return {
		open: false,
		title: '',
		description: '',
		cancelText: '',
		okText: '',
		msgType: 'info',
		onReturn: function (value: boolean): void {},
	}
}

export const tmplAlertDialogPropsConfirm = (): AlertDialogProps => {
	const res = tmplAlertDialogProps()
	res.cancelText = t('Cancel')
	res.okText = t('OK')
	return res
}

export const tmplMessageLineProps = (): MessageLineProps => {
	return {
		backgroundColor: '',
		color: '',
		description: '',
		open: false,
		title: '',
	}
}

export const tmplGlobal = (): Global => {
	return {
		appIsLoading: true,
		currentFileName: '',
		currentFilePath: '',
		editorType: TYPE_NONE,
		existConfigFile: false,
		fileTreeData: [],
		globalWebAlertDialogProps: tmplAlertDialogProps(),
		globalMessageLineProps: tmplMessageLineProps(),
		globalWebAlertDialogRes: null,
		isMobileOs: false,
		isMobileScreen: false,
		isPcOs: false,
		isPcScreen: false,
		lockscreen: true,
		openMenuTree: false,
		openMenuOpt: false,
		outlineHeadings: [],
		pathOfConfDir: '',
		pathOfHome: '',
		pathOfLogFile: '',
		pathOfUserFilesDefult: '',
		pathSeparator: '/',
		runInTauri: false,
		tabId: TAB_FILE_TREE,
		titlebarText: '',
		titlebarShowLockIcon: false,
		textDirection: 'LTR',
	}
}
