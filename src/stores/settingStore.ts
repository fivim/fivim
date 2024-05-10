import { action, makeAutoObservable, observable } from 'mobx'

import { GitlabApiConf, SyncMode } from '@/synchronizer/types'
import { Setting } from '@/types'
import { tmplSetting } from '@/types_template'

import globalStore from './globalStore'

class SettingStore {
	data = tmplSetting()

	constructor() {
		makeAutoObservable(
			this,
			{
				data: observable,
				setData: action,
				setDateTimeFormatValString: action,
				setEncryptedFileExt: action,
				setLocale: action,
				setTheme: action,
				getUserFilesDir: action,
				setPasswordSum: action,
				setForceDarkMode: action,
				setSyncMode: action,
				setSyncConfGitlabApi: action,
			},
			{ autoBind: true },
		)
	}

	getData() {
		return this.data
	}

	setData(value: Setting) {
		this.data = value
	}

	getUserFilesDir = () => {
		let userFilesDir = this.data.userFilesDir
		const ssep = globalStore.getData().pathSeparator
		if (!userFilesDir.endsWith(ssep)) {
			userFilesDir = userFilesDir + ssep
		}
		return userFilesDir
	}

	setDateTimeFormatValString(value: string) {
		this.data.dateTimeFormat = value
	}

	setEncryptedFileExt(value: string) {
		this.data.encryptedFileExt = value
	}

	setLocale(value: string) {
		this.data.locale = value
	}

	setTheme(value: string) {
		this.data.theme = value
	}

	setUserFilesDir(value: string) {
		this.data.userFilesDir = value
	}

	setPasswordSum(value: string) {
		this.data.passwordSum = value
	}

	setForceDarkMode(value: boolean) {
		this.data.forceDarkMode = value
	}

	setSyncMode(value: SyncMode) {
		this.data.sync.mode = value
	}

	setSyncConfGitlabApi(value: GitlabApiConf) {
		this.data.sync.conf.gitlabApi = value
	}
}

export default new SettingStore()
