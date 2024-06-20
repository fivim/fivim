import { TreeDataNode } from 'antd'

import { AlertDialogProps, AlertDialogRes } from '@/components/AlertDialog'
import { MessageLineProps } from '@/components/MessageLine'
import {
	TAB_SEARCH,
	TYPE_AUDIO,
	TYPE_IMAGE,
	TYPE_MD,
	TYPE_NONE,
	TYPE_PDF,
	TYPE_SOURCE_CODE,
	TYPE_XRTM,
} from '@/constants'
import {
	HTTP_CONNECT,
	HTTP_DELETE,
	HTTP_GET,
	HTTP_HEAD,
	HTTP_OPTIONS,
	HTTP_PATCH,
	HTTP_POST,
	HTTP_PUT,
	HTTP_TRACE,
} from '@/constants'
import { TAB_FILE_TREE, TAB_OUTLINE, TAB_SAVE, TAB_SETTING, TAB_SYNC } from '@/constants'
import { SyncSettings } from '@/synchronizer/types'

import { OutlineHeading } from './components/Editor/RichText/types'

export type OptionItem = { value: string; label: string }

export type StringNumberObj = {
	[key: string]: number
}

export type StringStringObj = {
	[key: string]: string
}

export type StringPair = [string, string]
export type NumberArray = number[]
export type StringArray = string[]
export type ObjectArray = object[]

export type Obj = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any
}

export type Func_Empty_Void = () => void
export type Func_Any_Void = (param: any) => void
export type Func_String_Void = (param: string) => void

export type HttpMethod =
	| typeof HTTP_GET
	| typeof HTTP_POST
	| typeof HTTP_PUT
	| typeof HTTP_DELETE
	| typeof HTTP_PATCH
	| typeof HTTP_HEAD
	| typeof HTTP_OPTIONS
	| typeof HTTP_CONNECT
	| typeof HTTP_TRACE

export type HttpRequest = {
	method: HttpMethod
	url: string
	body: string
	headerMap: {
		[key: string]: string
	}
	paramsMap: {
		[key: string]: string
	}
}

export type HttpResponse = {
	headers: object
	status: number
	data: any
	text: any
	errorMsg: string
}

export type MessageType = 'success' | 'warning' | 'error' | 'info' | 'confirm'

export type TextDirection = 'LTR' | 'RTL'

export type EditorType =
	| typeof TYPE_XRTM
	| typeof TYPE_MD
	| typeof TYPE_SOURCE_CODE
	| typeof TYPE_PDF
	| typeof TYPE_IMAGE
	| typeof TYPE_AUDIO
	| typeof TYPE_NONE

export type TabId =
	| typeof TAB_FILE_TREE
	| typeof TAB_OUTLINE
	| typeof TAB_SEARCH
	| typeof TAB_SAVE
	| typeof TAB_SYNC
	| typeof TAB_SETTING

export type AppCoreConf = {
	dataRootDir: string
	pathSeparator: string
	repo: string
	version: string
	userFilesDir: string
}

export type Setting = {
	dateTimeFormat: string
	encryptedFileExt: string
	forceDarkMode: boolean
	locale: string
	passwordSum: string // The SHA-256 hash of the password is only used to verify whether the password entered by the user is correct.
	sync: SyncSettings
	theme: string
	userFilesDir: string
}

export type SettingOfStartUp = {
	forceDarkMode: boolean // Force use of dark mode
	locale: string
	theme: string
}

export type Paths = {
	confDir: string
	cachedXrtm: string
	dataRootDir: string
	userFiles: string
	separator: string
}

export type Global = {
	appIsLoading: boolean // app loading status
	currentFileName: string
	currentFilePath: string
	editorType: EditorType
	existConfigFile: boolean
	fileTreeData: TreeDataNode[]
	globalWebAlertDialogProps: AlertDialogProps
	globalWebAlertDialogRes: AlertDialogRes
	globalMessageLineProps: MessageLineProps
	isMobileOs: boolean
	isMobileScreen: boolean
	isPcOs: boolean
	isPcScreen: boolean
	lockscreen: boolean
	openMenuTree: boolean
	openMenuOpt: boolean
	outlineHeadings: OutlineHeading[]
	paths: Paths
	runInTauri: boolean
	tabId: TabId
	titlebarText: string
	titlebarShowLockIcon: boolean
	textDirection: TextDirection
}
