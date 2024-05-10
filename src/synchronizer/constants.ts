import { TYPE_NONE } from '@/constants'
import i18n from '@/i18n'
import { OptionItem } from '@/types'

const t = i18n.t

export const TEMP_DIR_NAME = 'tempDir'
export const SYNC_LOCK_FILE_NAME = 'sync.lock'
export const APP_DATA_DIR_IN_USER_FILES_DIR = '___app_data___'

export const TYPE_ALIYUN_OSS = 'aliyunOss'
export const TYPE_AMAZON_S3 = 'amazonS3'
export const TYPE_GITEE_API_V5 = 'giteeApiV5'
export const TYPE_GITLAB_API = 'gitlabApi'
export const TYPE_GIT = 'git'
export const TYPE_WEB_DAV = 'webDav'

export const SYNC_MODE = {
	aliyunOss: TYPE_ALIYUN_OSS,
	amazonS3: TYPE_AMAZON_S3,
	git: TYPE_GIT,
	giteeApiV5: TYPE_GITEE_API_V5,
	gitlabApi: TYPE_GITLAB_API,
	webDav: TYPE_WEB_DAV,
}

export const SYNC_MODE_OPTIONS: OptionItem[] = [
	{
		value: TYPE_NONE,
		label: t('None'),
	},
	{
		value: SYNC_MODE.giteeApiV5,
		label: 'Gitee API V5',
	},
	{
		value: SYNC_MODE.gitlabApi,
		label: 'Gitlab API',
	},
]
