import i18n from '@/i18n'
import { invoker } from '@/invoker'
import globalStore from '@/stores/globalStore'
import settingStore from '@/stores/settingStore'
import { pathJoin } from '@/stores_utils/tauri_like'
import { appendToDirPathStr } from '@/utils/string'

import { APP_DATA_DIR_IN_USER_FILES_DIR, SYNC_LOCK_FILE_NAME, TEMP_DIR_NAME } from './constants'
import { CheckConfRes } from './types'

const t = i18n.t

export const tempRemoteZipFileName = 'temp_remote.zip'
export const tempRemoteDirName = 'temp_remote_dir'
export const userFilesDirBakDirPostfix = '_bak'
export const cellSeparator = '\t\t\t'

export type SyncActionRes = {
	disabled: boolean // Whether sync is disabled.
	success: boolean
	errMsg: string
}

export class SyncBase {
	checkConf = (): CheckConfRes => {
		throw new Error("SYNCHRONIZER'S METHOD checkConf NOT IMPLEMENTED")
	}

	sync = async (): Promise<SyncActionRes> => {
		throw new Error("SYNCHRONIZER'S METHOD 'sync' NOT IMPLEMENTED")
	}

	_getArchiveZip = async (rmtFilePath: string): Promise<SyncActionRes> => {
		throw new Error("SYNCHRONIZER'S METHOD _getArchiveZip NOT IMPLEMENTED")
	}

	_fileCreateText = async (filePath: string, fileContent: string, isbase64?: boolean): Promise<SyncActionRes> => {
		throw new Error("SYNCHRONIZER'S METHOD _fileCreateText NOT IMPLEMENTED")
	}

	_fileUpdateText = async (filePath: string, fileContent: string, isbase64?: boolean): Promise<SyncActionRes> => {
		throw new Error("SYNCHRONIZER'S METHOD _fileUpdateText NOT IMPLEMENTED")
	}

	_fileCreateBin = async (filePath: string): Promise<SyncActionRes> => {
		throw new Error("SYNCHRONIZER'S METHOD _fileCreateBin NOT IMPLEMENTED")
	}

	_fileUpdateBin = async (filePath: string): Promise<SyncActionRes> => {
		throw new Error("SYNCHRONIZER'S METHOD _fileUpdateBin NOT IMPLEMENTED")
	}

	_fileRename = async (filePathFrom: string, filePathTo: string): Promise<SyncActionRes> => {
		throw new Error("SYNCHRONIZER'S METHOD _fileRename NOT IMPLEMENTED")
	}

	_fileDelete = async (filePath: string): Promise<SyncActionRes> => {
		throw new Error("SYNCHRONIZER'S METHOD _fileDelete NOT IMPLEMENTED")
	}

	_dirDelete = async (filePath: string): Promise<SyncActionRes> => {
		throw new Error("SYNCHRONIZER'S METHOD _dirDelete NOT IMPLEMENTED")
	}

	_afterInitFromRemoteZip = async (): Promise<SyncActionRes> => {
		throw new Error("SYNCHRONIZER'S METHOD _afterInitFromRemoteZip NOT IMPLEMENTED")
	}

	// The following functions for manipulating files need to convert possible absolute paths to relative paths
	fileCreateText = async (filePath: string, fileContent: string, isbase64?: boolean): Promise<SyncActionRes> => {
		const cc = this.checkConf()
		if (cc.disabled || cc.unset) return { disabled: cc.disabled, success: true, errMsg: '' }
		if (cc.missConfig) return { disabled: false, success: false, errMsg: cc.errMsg }
		return await this._fileCreateText(filePath, fileContent, isbase64)
	}

	fileUpdateText = async (filePath: string, fileContent: string, isbase64?: boolean): Promise<SyncActionRes> => {
		const cc = this.checkConf()
		if (cc.disabled || cc.unset) return { disabled: cc.disabled, success: true, errMsg: '' }
		if (cc.missConfig) return { disabled: false, success: false, errMsg: cc.errMsg }
		return await this._fileUpdateText(filePath, fileContent, isbase64)
	}

	fileCreateBin = async (filePath: string): Promise<SyncActionRes> => {
		const cc = this.checkConf()
		if (cc.disabled || cc.unset) return { disabled: cc.disabled, success: true, errMsg: '' }
		if (cc.missConfig) return { disabled: false, success: false, errMsg: cc.errMsg }
		return await await this._fileCreateBin(filePath)
	}

	fileUpdateBin = async (filePath: string): Promise<SyncActionRes> => {
		const cc = this.checkConf()
		if (cc.disabled || cc.unset) return { disabled: cc.disabled, success: true, errMsg: '' }
		if (cc.missConfig) return { disabled: false, success: false, errMsg: cc.errMsg }
		return await this._fileUpdateBin(filePath)
	}

	fileRename = async (filePathFrom: string, filePathTo: string): Promise<SyncActionRes> => {
		const cc = this.checkConf()
		if (cc.disabled || cc.unset) return { disabled: cc.disabled, success: true, errMsg: '' }
		if (cc.missConfig) return { disabled: false, success: false, errMsg: cc.errMsg }
		return await this._fileRename(filePathFrom, filePathTo)
	}

	fileDelete = async (filePath: string): Promise<SyncActionRes> => {
		const cc = this.checkConf()
		if (cc.disabled || cc.unset) return { disabled: cc.disabled, success: true, errMsg: '' }
		if (cc.missConfig) return { disabled: false, success: false, errMsg: cc.errMsg }
		return await this._fileDelete(filePath)
	}

	dirDelete = async (filePath: string): Promise<SyncActionRes> => {
		const cc = this.checkConf()
		if (cc.disabled || cc.unset) return { disabled: cc.disabled, success: true, errMsg: '' }
		if (cc.missConfig) return { disabled: false, success: false, errMsg: cc.errMsg }
		return await this._dirDelete(filePath)
	}

	initFromRemoteZip = async (): Promise<SyncActionRes> => {
		const cc = this.checkConf()
		if (cc.disabled || cc.unset) return { disabled: cc.disabled, success: true, errMsg: '' }
		if (cc.missConfig) return { disabled: false, success: false, errMsg: cc.errMsg }

		await this.beforeSyncData()

		const GD = globalStore.getData()
		const userFilesDir = settingStore.getUserFilesDir() // user_files directory
		const userFilesDirBakDir = appendToDirPathStr(userFilesDir, userFilesDirBakDirPostfix) // Backup user_files directory
		const remoteFileTempDir = await pathJoin(GD.paths.dataRootDir, TEMP_DIR_NAME)
		const rmtFilePath = await pathJoin(remoteFileTempDir, tempRemoteZipFileName)
		const dd = await invoker.deleteDir(userFilesDirBakDir) // Backup user_files directory

		const gazr = await this._getArchiveZip(rmtFilePath)
		if (!gazr.success) return gazr

		const zipToDir = await pathJoin(remoteFileTempDir, tempRemoteDirName)

		if (!(await invoker.unzipFile(rmtFilePath, zipToDir)))
			return { disabled: false, success: false, errMsg: t('Failed to unzip file') }

		const ldca = await invoker.listDirChildren(zipToDir)
		if (ldca === null) return { disabled: false, success: false, errMsg: 'listDirChildren error' }
		let remoteFileDir = zipToDir
		if (ldca.length === 1 && ldca[0].is_dir) {
			remoteFileDir = await pathJoin(zipToDir, ldca[0].name)
		}

		if (!(await invoker.rename(userFilesDir, userFilesDirBakDir, true)))
			return { disabled: false, success: false, errMsg: t('Failed to rename') }
		if (!(await invoker.rename(remoteFileDir, userFilesDir, true)))
			return { disabled: false, success: false, errMsg: t('Failed to rename') }
		if (!(await invoker.deleteDir(userFilesDirBakDir)))
			return { disabled: false, success: false, errMsg: t('Failed to delete backup data') }

		const dr = await invoker.deleteDir(remoteFileTempDir)
		if (!dr) return { disabled: false, success: false, errMsg: t('Failed to delete temporary directory') }
		invoker.alert(t('Sync successful'))
		const ar = await this._afterInitFromRemoteZip()
		if (!ar) return ar

		return { disabled: false, success: true, errMsg: '' }
	}

	beforeSyncData = async () => {
		const lockFilePath = await pathJoin(
			settingStore.getUserFilesDir(),
			APP_DATA_DIR_IN_USER_FILES_DIR,
			SYNC_LOCK_FILE_NAME,
		)

		const wlr = await invoker.writeStringIntoFile(lockFilePath, '# This is a lock file of sync. ')
		if (wlr !== null && !wlr.success) {
			console.error('Save sync lock file error.')
			return false
		}
		return true
	}
}
