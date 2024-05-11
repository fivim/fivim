export const APP_NAME = 'enassi'
export const APP_VERSION = 'v2.0.46'
export const AVAILABLE_THEMES = [
	'default',
	'amber',
	'blue',
	'bronze',
	'grass',
	'lime',
	'mauve',
	'mint',
	'pink',
	'sky',
	'teal',
	'tomato',
	'violet',
]
export const CONFIG_FILE_NAME = 'conf.bin' // main configuration file
export const CONFIG_START_UP_FILE_NAME = 'conf.startup.json' // only read once on every startup

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 32
export const PASSWORD_SALT = '___enas^#$___' // DO NOT MODIFY, OR THE OLD DATA WILL NOT BE DECRYPTED!

export const LOCAL_FILE_LINK_PREFIX = 'enassi.file://'
export const TREE_DIR_PATH_PREFIX = '\r\r\r'

export const TYPE_AUDIO = 'AUDIO' // Audio files
export const TYPE_IMAGE = 'IMAGE' // Image files
export const TYPE_MD = 'MARKDOWN'
export const TYPE_NONE = 'NONE'
export const TYPE_PDF = 'PDF'
export const TYPE_SOURCE_CODE = 'SOURCE_CODE' // Programming source code files
export const TYPE_XRTM = 'XRTM'

export const TAB_FILE_TREE = 'FILE_TREE'
export const TAB_OUTLINE = 'OUTLINE'
export const TAB_SAVE = 'SAVE'
export const TAB_SYNC = 'SYNC'
export const TAB_SETTING = 'SETTING'

export const HTTP_GET = 'GET'
export const HTTP_POST = 'POST'
export const HTTP_PUT = 'PUT'
export const HTTP_DELETE = 'DELETE'
export const HTTP_PATCH = 'PATCH'
export const HTTP_HEAD = 'HEAD'
export const HTTP_OPTIONS = 'OPTIONS'
export const HTTP_CONNECT = 'CONNECT'
export const HTTP_TRACE = 'TRACE'
