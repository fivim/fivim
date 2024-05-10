//
// The code in this file can be run independently of other code in the project.
//
import { TreeDataNode } from 'antd'

import { AppCoreConf } from '@/types'
import { HttpMethod, HttpResponse, MessageType, StringPair, StringStringObj } from '@/types'

import { cmdAdapter } from './adapter'
import { FileInfo, ProgressStatus, WriteFileRes } from './types'

const ivk = () => {
	const invoke = cmdAdapter().invoke
	return invoke
}

export type SyncListResItemLocalDisk = {
	name: string
	is_dir: boolean
	modified_time_stamp: number
}

// Call tauri commands. Consistent with the rust code
// Unify the parameter naming and type of the invoke function.
export const invoker = {
	showMessage: (title: string, message: string, messageType: MessageType, showConfirmBtn: boolean) =>
		cmdAdapter().showMessage(title, message, messageType, showConfirmBtn),
	alert: (message: string) => cmdAdapter().showMessage('', message, 'info', false),
	confirm: (message: string, title: string) => cmdAdapter().showMessage(title, message, 'confirm', true),
	success: (message: string) => cmdAdapter().showMessage('', message, 'success', false),
	warning: (message: string) => cmdAdapter().showMessage('', message, 'warning', false),
	error: (message: string) => cmdAdapter().showMessage('', message, 'error', false),
	reoladWindow: () => cmdAdapter().reoladWindow(),
	pickFile: (allowedExtensions?: string[]) => cmdAdapter().pickFile(allowedExtensions),
	pickFiles: (allowedExtensions?: string[]) => cmdAdapter().pickFiles(allowedExtensions),

	// fs
	addFile: (filePath: string) => ivk()<boolean>('add_file', { filePath }),
	copyFile: (filePath: string, targetFilePath: string) => ivk()<boolean>('copy_file', { filePath, targetFilePath }),
	deleteFile: (filePath: string) => ivk()<boolean>('delete_file', { filePath }),
	existFile: (filePath: string) => ivk()<boolean>('exist_file', { filePath }),
	readFileToString: (filePath: string) => ivk()<string>('read_file_to_string', { filePath }),
	readFileToBase64String: (filePath: string) => ivk()<string>('read_file_to_base64_string', { filePath }),
	writeStringIntoFile: (filePath: string, fileContent: string) =>
		ivk()<WriteFileRes>('write_string_into_file', { filePath, fileContent }),
	writeBase64IntoFile: (filePath: string, fileContent: string) =>
		ivk()<WriteFileRes>('write_base64_into_file', { filePath, fileContent }), // TODO: not used
	addDir: (dirPath: string) => ivk()<boolean>('add_dir', { dirPath }),
	deleteDir: (dirPath: string) => ivk()<boolean>('delete_dir', { dirPath }),
	getDirSize: (dirPath: string) => ivk()<number>('get_dir_size', { dirPath }),
	listDirChildren: (dirPath: string) => ivk()<SyncListResItemLocalDisk[]>('list_dir_children', { dirPath }),
	rename: (pathOld: string, pathNew: string, isDir: boolean) => ivk()<boolean>('rename', { pathOld, pathNew, isDir }),
	updateFileModifiedTime: (filePath: string, iso8601String: string) =>
		ivk()<boolean>('update_file_modified_time', { filePath, iso8601String }),
	fileInfo: (filePath: string) => ivk()<FileInfo>('file_info', { filePath }),
	treeInfo: (dirPath: string) => ivk()<TreeDataNode>('tree_info', { dirPath }),
	walkDirItemsGetPathAndModifyTime: (dirPath: string, filePath: string, excludeDires: string[]) =>
		ivk()<string>('walk_dir_items_get_path_and_modify_time', { dirPath, filePath, excludeDires }),
	walkDirItemsGetPath: (dirPath: string, filePath: string, excludeDires: string[]) =>
		ivk()<string[]>('walk_dir_items_get_path', { dirPath, filePath, excludeDires }),
	zipDir: (dirPath: string, filePath: string) => ivk()<boolean>('zip_dir', { dirPath, filePath }),
	unzipFile: (filePath: string, dirPath: string) => ivk()<boolean>('unzip_file', { dirPath, filePath }),

	// encrypt_hash
	// Read and write the configuration files.
	encryptStringToFile: (pwd: number[], filePath: string, fileContent: string) => {
		return ivk()<WriteFileRes>('encrypt_string_into_file', { pwd, filePath, fileContent })
	},
	decryptFileToString: (pwd: number[], filePath: string) => {
		return ivk()<string>('decrypt_file_to_string', { pwd, filePath })
	},
	// Encrypt and decrypt the text files which are set to encrypt when save the content.
	encryptStringArray: (pwd: number[], content: string[]) => ivk()<string[]>('encrypt_string_array', { pwd, content }),
	decryptStringArray: (pwd: number[], content: string[]) => ivk()<string[]>('decrypt_string_array', { pwd, content }),

	// Read and write the files that users imported.
	encryptLocalFile: (pwd: number[], filePathFrom: string, filePathTo: string) => {
		return ivk()<WriteFileRes>('encrypt_local_file', { pwd, filePathFrom, filePathTo })
	},
	encryptLocalFileContentBase64: (pwd: number[], content: number[]) => {
		return ivk()<string>('encrypt_local_file_content_base64', { pwd, content })
	},
	decryptLocalFile: (pwd: number[], filePathFrom: string, filePathTo: string) => {
		return ivk()<string>('decrypt_local_file', { pwd, filePathFrom, filePathTo })
	},
	decryptLocalFileBase64: (pwd: number[], filePath: string) => {
		return ivk()<string>('decrypt_local_file_base64', { pwd, filePath })
	},
	sha256ByFilePath: (filePath: string) => ivk()<string>('sha256_by_file_path', { filePath }),
	stringSha256: (str: string) => ivk()<string>('string_sha256', { content: str }),
	stringCrc32: (str: string) => ivk()<number>('string_crc32', { content: str }),

	// net
	downloadFile: (
		method: HttpMethod,
		url: string,
		filePath: string,
		headerMap: StringStringObj,
		paramsMap: StringStringObj,
		isLargeFile: boolean,
		progressName: string,
	) => ivk()<boolean>('download_file', { method, url, filePath, headerMap, paramsMap, isLargeFile, progressName }),

	httpRequestText: (
		method: HttpMethod,
		url: string,
		body: string,
		headerMap: StringStringObj,
		paramsMap: StringStringObj,
	) => ivk()<HttpResponse>('http_request', { method, url, respDataType: 'text', headerMap, paramsMap, body }),
	httpRequestBase64: (
		method: HttpMethod,
		url: string,
		body: string,
		headerMap: StringStringObj,
		paramsMap: StringStringObj,
	) => ivk()<HttpResponse>('http_request', { method, url, respDataType: 'base64', headerMap, paramsMap, body }),

	// other
	logInfo: (content: string) => {
		console.info('log info::', content)
		ivk()('log', { level: 'INFO', content })
	},
	logError: (content: string) => {
		console.error('log error::', content)
		ivk()('log', { level: 'ERROR', content })
	},
	logDebug: (content: string) => {
		console.debug('log debug::', content)
		ivk()('log', { level: 'DEBUG', content })
	},
	getProgress: (progressName: string) => ivk()<ProgressStatus>('get_progress', { progressName }),
	getAppCoreConf: () => ivk()<AppCoreConf>('get_app_core_conf', {}),
	jsonToToml: (content: string) => ivk()<StringPair>('json_to_toml', { content }),
	tomlToJson: (content: string) => ivk()<StringPair>('toml_to_json', { content }),
}
