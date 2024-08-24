import { Base64 } from 'js-base64'
import { DateTime } from 'luxon'

import { TYPE_NONE } from '@/constants'
import { HTTP_DELETE, HTTP_GET, HTTP_POST, HTTP_PUT } from '@/constants'
import i18n from '@/i18n'
import { saveConfToFile } from '@/initialize'
import { invoker } from '@/invoker'
import globalStore from '@/stores/globalStore'
import settingStore from '@/stores/settingStore'
import { pathJoin } from '@/stores_utils/tauri_like'

import { SYNC_LOCK_FILE_NAME } from './constants'
import { SyncActionRes, SyncBase } from './sync_base'
import { CheckConfRes } from './types'

const t = i18n.t

type CommitActionName = 'create' | 'delete' | 'move' | 'update' | 'chmod'

// Use the naming convention in Gitlab api documentation
type CommitActionDataItem = {
	action: CommitActionName
	path: string
	previous_path?: string
	content?: string
	encoding?: 'text' | 'base64'
}

type CommitActionData = {
	access_token: string
	branch: string
	message: string
	actions: CommitActionDataItem[]
}

type GitlabCommitItem = {
	id: string
	committed_date: string
}

/**
 * Get commits history
 *
 * @param filePath
 * @param sinceStr Start time (granularity is date)
 * @param untilStr End time (granularity is date)
 * @param page Current page
 * @param perPage Number of items per page
 * @returns
 *
 */
const getCommitsHistory = async (
	filePath: string,
	sinceStr: string,
	untilStr: string,
	page: number,
	perPage: number,
) => {
	const settings = settingStore.data
	const ss = settings.sync.conf.giteeApi
	let url = `https://gitee.com/api/v5/repos/${ss.owner}/${ss.repo}/commits?access_token=${ss.token}&sha=${ss.branch}`

	if (perPage > 0 && page > 0) url = url + `&per_page=${perPage}&page=${page}`
	if (filePath !== '') url = url + `&path=${filePath}`
	if (sinceStr !== '') url = url + `&since=${sinceStr}`
	if (untilStr !== '') url = url + `&until=${untilStr}`

	let commitsArr: GitlabCommitItem[] = []

	const res = await invoker.httpRequestText(HTTP_GET, url, '', {}, {})
	if (res === null) {
		return commitsArr
	} else if (res.errorMsg !== '') {
		invoker.alert(res.errorMsg)
		return commitsArr
	} else if (res.status === 401) {
		console.error('>>> getCommitsHistory error: ', getErrorMsg(res.text))
	} else if (res.status === 200) {
		commitsArr = JSON.parse(res.text) as GitlabCommitItem[]
	} else {
		invoker.alert(t('Exception in obtaining commit information'))
	}

	return commitsArr
}

const getCommitsHistoryAll = async (filePath: string, sinceStr: string, untilStr: string) => {
	let commitsArr: GitlabCommitItem[] = []

	let stop = false
	let page = 1
	const perPage = 100
	while (!stop) {
		const arr = await getCommitsHistory(filePath, sinceStr, untilStr, page, perPage)
		commitsArr = commitsArr.concat(arr)
		page++
		if (arr.length < perPage) stop = true
	}

	return commitsArr
}

type compareRemoteCommitResDiff = {
	old_path: string
	new_path: string
	deleted_file: boolean
	renamed_file: boolean
	new_file: boolean
}
type compareRemoteCommitRes = {
	base_commit: object
	commits: object[]
	diffs: compareRemoteCommitResDiff[]
}

const commitMultipleItems = async (actions: CommitActionDataItem[], commitName: string) => {
	const settings = settingStore.data
	const ss = settings.sync.conf.giteeApi
	const url = `https://gitee.com/api/v5/repos/${ss.owner}/${ss.repo}/commits`
	const headeMap = {
		'Content-Type': 'application/json',
	}

	const commitReqData: CommitActionData = {
		access_token: ss.token,
		branch: ss.branch,
		message: `${commitName}`,
		actions,
	}

	const body = JSON.stringify(commitReqData)

	const res = await invoker.httpRequestText(HTTP_POST, url, body, headeMap, {})
	if (res === null) {
		return false
	} else if (res.errorMsg !== '') {
		return false
	} else if (res.status === 200 || res.status === 201) {
		return true
	}

	return false
}

const compareRemoteCommitDiff = async (from: string, to: string) => {
	const settings = settingStore.data
	const ss = settings.sync.conf.giteeApi
	const url = `https://gitee.com/api/v5/repos/${ss.owner}/${ss.repo}/compare/${from}...${to}?access_token=${ss.token}`

	let diff: compareRemoteCommitRes = {
		base_commit: {},
		commits: [],
		diffs: [],
	}

	const res = await invoker.httpRequestText(HTTP_GET, url, '', {}, {})
	if (res === null) {
		return diff
	} else if (res.errorMsg !== '') {
		invoker.alert(res.errorMsg)
		return diff
	} else if (res.status === 200) {
		diff = JSON.parse(res.text) as compareRemoteCommitRes
	} else {
		invoker.alert(t('Exception in obtaining commit information'))
	}

	return diff
}

// Get the last commit ID
const getRemoteLastCommitId = async () => {
	const rmtLastCommit = await getCommitsHistory('', '', '', 1, 1)

	if (rmtLastCommit.length === 0) {
		return ''
	}
	return rmtLastCommit[0].id
}

const syncSettings = () => {
	return settingStore.data.sync.conf.giteeApi
}

// Update the last commit and time of the last sync, etc.
const updateSyncInfo = async (rmtLastCommitId: string) => {
	const settings = settingStore.data
	const ss = syncSettings()
	if (rmtLastCommitId === '') {
		rmtLastCommitId = await getRemoteLastCommitId()
	}

	if (rmtLastCommitId === '') {
		invoker.alert(t('Failed to obtain the last remote commit record'))
		return false
	}

	ss.lastCommitId = rmtLastCommitId
	ss.lastSyncTime = DateTime.now()
	settingStore.setData(settings)
	saveConfToFile()

	return true
}

type FileDetail = {
	// download_url: string
	// html_url: string
	// name: string
	// path: string
	sha: string
	// size: number
	// type: string
	// url: string
}

const getFileDetail = async (filePath: string): Promise<FileDetail> => {
	const ss = syncSettings()
	const rmtPath = encodeURIComponent(filePath)
	const url = `https://gitee.com/api/v5/repos/${ss.owner}/${ss.repo}/contents/${rmtPath}?access_token=${ss.token}&ref${ss.branch}`
	const headeMap = {
		'Content-Type': 'application/json',
	}
	const body = {}

	const res = await invoker.httpRequestText(HTTP_GET, url, JSON.stringify(body), headeMap, {})
	if (res === null) {
		return { sha: '' }
	} else if (res.status !== 200) {
		console.error('>>> getFileDetail error: ', getErrorMsg(res.text))
		return { sha: '' }
	}

	const detail = JSON.parse(res.text) as FileDetail
	return detail
}

const getErrorMsg = (text: string) => {
	const jsonData = JSON.parse(text)

	if ('messages' in jsonData) return jsonData.messages.join(',')
	if ('message' in jsonData) return jsonData.message

	return ''
}

export class SyncGiteeApiV5 extends SyncBase {
	allowedMethod = () => {
		return [
			'fileCreateText',
			'fileUpdateText',
			'fileCreateBin',
			'fileUpdateBin',
			'fileRename',
			// 'dirRename',
			'fileDelete',
			// 'dirDelete',
			'sync',
			'initFromRemoteZip',
		]
	}

	checkConf = (): CheckConfRes => {
		const settings = settingStore.data
		const syncSettings = settings.sync.conf.giteeApi

		if (settings.sync.mode === TYPE_NONE) {
			return { disabled: true, unset: false, missConfig: false, errMsg: '' }
		}

		if (
			syncSettings.owner === '' &&
			syncSettings.repo === '' &&
			syncSettings.branch === '' &&
			syncSettings.token === ''
		) {
			return { disabled: false, unset: true, missConfig: false, errMsg: '' }
		}

		if (syncSettings.owner === '') {
			return {
				disabled: false,
				unset: false,
				missConfig: true,
				errMsg: t('Please input ___name___', { name: 'owner' }),
			}
		}
		if (syncSettings.repo === '') {
			return {
				disabled: false,
				unset: false,
				missConfig: true,
				errMsg: t('Please input ___name___', { name: 'repo' }),
			}
		}
		if (syncSettings.branch === '') {
			return {
				disabled: false,
				unset: false,
				missConfig: true,
				errMsg: t('Please input ___name___', { name: t('Branch') }),
			}
		}
		if (syncSettings.token === '') {
			return {
				disabled: false,
				unset: false,
				missConfig: true,
				errMsg: t('Please input ___name___', { name: t('Token') }),
			}
		}

		return { disabled: false, unset: false, missConfig: false, errMsg: '' }
	}

	_getArchiveZip = async (rmtFilePath: string) => {
		const ss = syncSettings()
		const url = `https://gitee.com/api/v5/repos/${ss.owner}/${ss.repo}/zipball?ref=${ss.branch}&access_token=${ss.token}`

		const dr = await invoker.downloadFile(HTTP_GET, url, rmtFilePath, {}, {}, false, '')
		if (!dr) {
			return { disabled: false, success: false, errMsg: t('Download failed') }
		}

		return Promise.resolve({ disabled: false, success: true, errMsg: '' })
	}

	_afterInitFromRemoteZip = async () => {
		updateSyncInfo('')
		return Promise.resolve({ disabled: false, success: true, errMsg: '' })
	}

	_fileCreateText = async (filePath: string, fileContent: string, isbase64?: boolean) => {
		const ss = syncSettings()
		const rmtPath = encodeURIComponent(filePath)
		const url = `https://gitee.com/api/v5/repos/${ss.owner}/${ss.repo}/contents/${rmtPath}`
		const headeMap = {
			'Content-Type': 'application/json',
		}
		const body = {
			access_token: ss.token,
			branch: ss.branch,
			content: Base64.encode(fileContent || '\n'), // Cannot be empty.
			message: `create file: ${filePath}`,
		}

		const res = await invoker.httpRequestText(HTTP_POST, url, JSON.stringify(body), headeMap, {})
		if (res === null) {
			return { disabled: false, success: false, errMsg: 'httpRequestText error' }
		} else if (res.errorMsg !== '') {
			return { disabled: false, success: false, errMsg: res.errorMsg }
		} else if (res.status === 400) {
			return { disabled: false, success: false, errMsg: getErrorMsg(res.text) }
		} else if (res.status === 200 || res.status === 201) {
			return { disabled: false, success: true, errMsg: '' }
		} else {
			return { disabled: false, success: false, errMsg: res.text }
		}
	}

	_fileCreateBin = async (filePath: string) => {
		const ss = syncSettings()
		const rmtPath = encodeURIComponent(filePath)
		const url = `https://gitee.com/api/v5/repos/${ss.owner}/${ss.repo}/contents/${rmtPath}`
		const headeMap = {
			'Content-Type': 'application/json',
		}

		const fp = await pathJoin(globalStore.data.paths.userFiles, filePath)
		const ccc = await invoker.readFileToBase64String(fp)
		if (ccc === null) {
			return { disabled: false, success: false, errMsg: 'readFileToBase64String error' }
		}
		const body = {
			access_token: ss.token,
			branch: ss.branch,
			content: ccc,
			message: `create file: ${filePath}`,
		}

		const res = await invoker.httpRequestText(HTTP_POST, url, JSON.stringify(body), headeMap, {})
		if (res === null) {
			return { disabled: false, success: false, errMsg: 'httpRequestText error' }
		} else if (res.errorMsg !== '') {
			return { disabled: false, success: false, errMsg: res.errorMsg }
		} else if (res.status === 200 || res.status === 201) {
			return { disabled: false, success: true, errMsg: '' }
		} else {
			return { disabled: false, success: false, errMsg: res.text }
		}
	}

	_fileUpdateText = async (filePath: string, fileContent: string, isbase64?: boolean) => {
		const ss = syncSettings()
		const rmtPath = encodeURIComponent(filePath)
		const url = `https://gitee.com/api/v5/repos/${ss.owner}/${ss.repo}/contents/${rmtPath}`
		const headeMap = {
			'Content-Type': 'application/json',
		}

		const fileDetail = await getFileDetail(filePath)
		const body = {
			access_token: ss.token,
			branch: ss.branch,
			content: Base64.encode(fileContent || '\n'), // Cannot be empty.
			sha: fileDetail.sha,
			message: `update file: ${filePath}`,
		}

		const res = await invoker.httpRequestText(HTTP_PUT, url, JSON.stringify(body), headeMap, {})
		if (res === null) {
			return { disabled: false, success: false, errMsg: 'httpRequestText error' }
		} else if (res.errorMsg !== '') {
			return { disabled: false, success: false, errMsg: res.errorMsg }
		} else if (res.status === 200) {
			return { disabled: false, success: true, errMsg: '' }
		} else {
			return { disabled: false, success: false, errMsg: res.text }
		}
	}

	_fileRename = async (filePathFrom: string, filePathTo: string) => {
		const ss = syncSettings()
		const url = `https://gitee.com/api/v5/repos/${ss.owner}/${ss.repo}/commits`
		const headeMap = {
			'Content-Type': 'application/json',
		}

		const ccc = await invoker.readFileToBase64String(await pathJoin(globalStore.data.paths.userFiles, filePathFrom))
		if (ccc === null) {
			return { disabled: false, success: false, errMsg: 'readFileToBase64String error' }
		}
		const commitReqData: CommitActionData = {
			access_token: ss.token,
			branch: ss.branch,
			message: `rename ${filePathFrom} to ${filePathTo}`,
			actions: [
				{
					action: 'move',
					path: filePathTo,
					previous_path: filePathFrom,
					encoding: 'base64',
					content: ccc,
				},
			],
		}

		const body = JSON.stringify(commitReqData)
		const res = await invoker.httpRequestText(HTTP_POST, url, body, headeMap, {})
		if (res === null) {
			return { disabled: false, success: false, errMsg: 'httpRequestText error' }
		} else if (res.errorMsg !== '') {
			return { disabled: false, success: false, errMsg: res.errorMsg }
		}

		return { disabled: false, success: true, errMsg: '' }
	}

	_fileDelete = async (filePath: string) => {
		const ss = syncSettings()
		const rmtPath = encodeURIComponent(filePath)
		const url = `https://gitee.com/api/v5/repos/${ss.owner}/${ss.repo}/contents/${rmtPath}`
		const headeMap = {
			'Content-Type': 'application/json',
		}
		const fileDetail = await getFileDetail(filePath)
		const body = {
			access_token: ss.token,
			sha: fileDetail.sha,
			message: `delete file: ${filePath}`,
		}

		const res = await invoker.httpRequestText(HTTP_DELETE, url, JSON.stringify(body), headeMap, {})
		if (res === null) {
			return { disabled: false, success: false, errMsg: 'httpRequestText error' }
		} else if (res.errorMsg !== '') {
			return { disabled: false, success: false, errMsg: res.errorMsg }
		} else if (res.status === 400) {
			return { disabled: false, success: false, errMsg: getErrorMsg(res.text) }
		} else if (res.status === 204) {
			// Delete successfully and return this status code without processing
		} else if (res.status !== 200) {
			return {
				disabled: false,
				success: false,
				errMsg: t('Exception in deleting remote files ___name___', { name: res }),
			}
		}

		return { disabled: false, success: true, errMsg: '' }
	}

	_dirDelete = async (dirPath: string) => {
		const dir = await pathJoin(globalStore.data.paths.userFiles, dirPath)
		const lines = await invoker.walkDirItemsGetPath(dir, '', [])
		if (lines === null) return { disabled: false, success: false, errMsg: 'walkDirItemsGetPath error' }
		const commitActions: CommitActionDataItem[] = []
		for (const item of lines) {
			if (item === '') {
				continue
			}
			commitActions.push({
				action: 'delete',
				path: dirPath + item,
			})
		}

		const cr = await commitMultipleItems(commitActions, `delete dir: ${dirPath}`)
		if (!cr) return { disabled: false, success: false, errMsg: t('Request failed') }

		return { disabled: false, success: true, errMsg: '' }
	}

	_downloadRemoteFile = async (filePath: string, isLarge: boolean) => {
		const ss = syncSettings()
		const rmtPath = encodeURIComponent(filePath)
		const url = `https://gitee.com/api/v5/repos/${ss.owner}/${ss.repo}/raw/${rmtPath}?ref=${ss.branch}&access_token=${ss.token}`

		const localPath = await pathJoin(globalStore.data.paths.userFiles, filePath)
		const ret = await invoker.downloadFile(HTTP_GET, url, localPath, {}, {}, isLarge, '')
		if (ret) return true
		return false
	}

	sync = async (): Promise<SyncActionRes> => {
		const cc = this.checkConf()
		if (cc.disabled || cc.unset) return { disabled: cc.disabled, success: true, errMsg: '' }
		if (cc.missConfig) return { disabled: false, success: false, errMsg: cc.errMsg }

		const ss = syncSettings()

		// Write lock file
		const lockFilePath = await pathJoin(globalStore.data.paths.userFiles, SYNC_LOCK_FILE_NAME)
		const wlr = await invoker.writeStringIntoFile(lockFilePath, '# This is a lock file of sync. ')
		if (wlr === null || !wlr.success) {
			return { disabled: false, success: false, errMsg: t('Failed to write synchronization lock file') }
		}

		// Last cimmit time
		const lclLastCommitId = ss.lastCommitId
		const lclLastSyncTime = ss.lastSyncTime
		if (!lclLastSyncTime || lclLastSyncTime.toUnixInteger() === 0) {
			if (await invoker.confirm(t('Last synchronization time was empty, please initialize first!'), t('Warning'))) {
				return {
					disabled: false,
					success: false,
					errMsg: t('Last synchronization time was empty, please initialize first!'),
				}
			}
		}

		// Find the last commit ID
		const rmtLastCommitId = await getRemoteLastCommitId()
		if (rmtLastCommitId === '') {
			return { disabled: false, success: false, errMsg: t('Failed to obtain the last remote commit record') }
		}

		const diffs = await compareRemoteCommitDiff(lclLastCommitId, rmtLastCommitId)
		const lclWillDelFiles = [] // The local files to be deleted
		const rmtWillDldFiles = [] // The remote files to be downloaded

		for (const item of diffs.diffs) {
			if (item.deleted_file) {
				// Deleted files
				lclWillDelFiles.push(item.old_path || item.new_path)
			} else if (item.new_file) {
				// Created files
				rmtWillDldFiles.push(item.old_path || item.new_path)
			} else if (item.renamed_file) {
				// Renamed files
				lclWillDelFiles.push(item.old_path)
				rmtWillDldFiles.push(item.new_path)
			} else {
				// Updated files
				lclWillDelFiles.push(item.old_path)
				rmtWillDldFiles.push(item.new_path)
			}
		}

		// Since it is required to be online to create/edit/delete files, there is no need to consider the issue of submitting updated text files here.
		// Delete all old_path
		for (const fp of lclWillDelFiles) {
			const ffp = await pathJoin(globalStore.data.paths.userFiles, fp)
			console.info(`Delete local file: ${ffp}`)
			await invoker.deleteFile(ffp)
		}

		// Download all new_path
		for (const fp of rmtWillDldFiles) {
			console.info(`Download remote file: ${fp}`)
			await this._downloadRemoteFile(fp, true)
		}

		updateSyncInfo(rmtLastCommitId)

		const dlr = await invoker.deleteFile(lockFilePath)
		if (!dlr) {
			console.error('Failed to delete sync lock file')
		}

		return { disabled: false, success: true, errMsg: '' }
	}
}
