import { DateTime } from 'luxon'

import { TYPE_NONE } from '@/constants'

import {
	TYPE_ALIYUN_OSS,
	TYPE_AMAZON_S3,
	TYPE_GIT,
	TYPE_GITEE_API_V5,
	TYPE_GITLAB_API,
	TYPE_WEB_DAV,
} from './constants'
import { SyncActionRes } from './sync_base'

export interface Synchronizer {
	// allowedMethod(): SynchronizerMethod[] // TODO:
	checkConf(): CheckConfRes
	initFromRemoteZip(): Promise<SyncActionRes>
	sync(): Promise<SyncActionRes>
	fileCreateText(filePath: string, fileContent: string, isbase64?: boolean): Promise<SyncActionRes>
	fileUpdateText(filePath: string, fileContent: string, isbase64?: boolean): Promise<SyncActionRes>
	fileCreateBin(filePath: string): Promise<SyncActionRes>
	fileUpdateBin(filePath: string): Promise<SyncActionRes>
	fileRename(filePathFrom: string, filePathTo: string): Promise<SyncActionRes>
	// TODO:
	// dirRename(filePathFrom: string, filePathTo: string): Promise<SyncActionRes>
	fileDelete(filePath: string): Promise<SyncActionRes>
	dirDelete(filePath: string): Promise<SyncActionRes>
}

type SynchronizerMethod =
	| 'fileCreateText'
	| 'fileUpdateText'
	| 'fileCreateBin'
	| 'fileUpdateBin'
	| 'fileRename'
	| 'dirRename'
	| 'fileDelete'
	| 'dirDelete'
	| 'sync'
	| 'initFromRemoteZip'

export type CheckConfRes = {
	disabled: boolean // Whether sync is disabled.
	errMsg: string
	missConfig: boolean // Whether the sync configure is complete.
	unset: boolean // Whether the sync configure is unset.
}

export type SyncMode =
	| typeof TYPE_NONE
	| typeof TYPE_ALIYUN_OSS
	| typeof TYPE_AMAZON_S3
	| typeof TYPE_GITEE_API_V5
	| typeof TYPE_GITLAB_API
	| typeof TYPE_GIT
	| typeof TYPE_WEB_DAV

export type GitlabApiConf = {
	lastSyncTime: DateTime
	lastCommitId: string
	siteUrl: string
	token: string
	projectId: string
	branch: string
}

export type GiteeApiConf = {
	lastSyncTime: DateTime
	lastCommitId: string
	owner: string
	repo: string
	token: string
	branch: string
}

export type SyncSettings = {
	mode: SyncMode
	conf: {
		gitlabApi: GitlabApiConf
		giteeApi: GiteeApiConf
	}
}
