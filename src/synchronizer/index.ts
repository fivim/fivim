import { TYPE_NONE } from '@/constants'
import settingStore from '@/stores/settingStore'

import { SYNC_MODE } from './constants'
import { SyncGiteeApiV5 } from './sync_gitee_api_v5'
import { SyncGitlabApi } from './sync_gitlab_api'
import { Synchronizer } from './types'

export const syncAdapter = (): Synchronizer => {
	const SD = settingStore.getData()
	switch (SD.sync.mode) {
		case SYNC_MODE.giteeApiV5:
			return new SyncGiteeApiV5()
		case SYNC_MODE.gitlabApi:
			return new SyncGitlabApi()
	}
	return new SyncGitlabApi()
}

export const syncIsEnabled = () => {
	const SD = settingStore.getData()
	return SD.sync.mode !== TYPE_NONE
}
