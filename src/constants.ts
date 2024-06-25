import { CN_WORKPLACE_ELE } from '@exsied/exsied'

export const APP_NAME = 'Fivim'
export const APP_VERSION = 'v2.3.1'
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

export const SUB_DIR_CONF = 'conf'
export const SUB_DIR_USER_FILES = 'user_files'
export const SUB_DIR_CACHED_XRTM = 'cached_xrtm'

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 32
export const PASSWORD_SALT = '___enas^#$___' // DO NOT MODIFY, OR THE OLD DATA WILL NOT BE DECRYPTED!

export const LOCAL_FILE_LINK_PREFIX = 'fivim.file://'
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
export const TAB_SEARCH = 'SEARCH'
export const TAB_SAVE = 'SAVE'
export const TAB_SYNC = 'SYNC'
export const TAB_SETTING = 'SETTING'
export const TAB_CONTENT_TAGS = 'CONTENT_TAGS'
export const TAB_LINK_TAGS = 'LINK_TAGS'

export const HTTP_GET = 'GET'
export const HTTP_POST = 'POST'
export const HTTP_PUT = 'PUT'
export const HTTP_DELETE = 'DELETE'
export const HTTP_PATCH = 'PATCH'
export const HTTP_HEAD = 'HEAD'
export const HTTP_OPTIONS = 'OPTIONS'
export const HTTP_CONNECT = 'CONNECT'
export const HTTP_TRACE = 'TRACE'

export const CN_WORKPLACE_EXSIED = CN_WORKPLACE_ELE
export const CN_WORKPLACE_CODEMIRROR = 'cm-content'

export const EXT_HTML_LIKE = ['html', 'xrtm']
export const EXT_RICH_TEXT = ['xrtm']
export const EXT_MARKDOWN = ['md']
export const EXT_PDF = ['pdf']
export const EXT_IMAGE = ['bmp', 'jpg', 'jpeg', 'png', 'gif']
export const EXT_SOURCE_CODE = [
	'c',
	'c++',
	'cpp',
	'cs',
	'css',
	'cxx',
	'go',
	'h',
	'hpp',
	'htm',
	'html',
	'hxx',
	'java',
	'jl',
	'js',
	'json',
	'kt',
	'log',
	'php',
	'pl',
	'pm',
	'py',
	'r',
	'rs',
	'sql',
	'swift',
	'ts',
	'xml',
	//
	'txt',
]
export const EXT_AUDIO = ['aac', 'aif', 'aiff', 'ape', 'flac', 'mid', 'mp3', 'ogg', 'wav', 'wma']
