//
// The code in this file can be run independently of other code in the project.
//
import { TreeDataNode } from 'antd'

import { AppCoreConf } from '@/types'
import { HttpMethod, HttpResponse, MessageType, StringPair, StringStringObj } from '@/types'

import { cmdAdapter } from './adapter'
import { FileInfo, InvokeArgs, InvokeOptions, ProgressStatus, SearchFileRes, WriteFileRes } from './types'

async function runIvk<T>(_cmd: string, _args?: InvokeArgs, _options?: InvokeOptions) {
	const invoke = cmdAdapter().invoke<T>
	let res = null

	try {
		res = await invoke(_cmd, _args, _options)
	} catch (error) {
		console.error('>>> Invoke error: ', error, invoke)

		invoker.confirm(`${error}`, 'Error')
	}

	return res as T
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
	addFile: (filePath: string) => runIvk<boolean | null>('add_file', { filePath }),
	copyFile: (filePath: string, targetFilePath: string) =>
		runIvk<boolean | null>('copy_file', { filePath, targetFilePath }),
	deleteFile: (filePath: string) => runIvk<boolean | null>('delete_file', { filePath }),
	existFile: (filePath: string) => runIvk<boolean | null>('exist_file', { filePath }),
	readFileToString: (filePath: string) => runIvk<string | null>('read_file_to_string', { filePath }),
	readFileToBase64String: (filePath: string) => runIvk<string | null>('read_file_to_base64_string', { filePath }),
	writeStringIntoFile: (filePath: string, fileContent: string) =>
		runIvk<WriteFileRes | null>('write_string_into_file', { filePath, fileContent }),
	writeBase64IntoFile: (filePath: string, fileContent: string) =>
		runIvk<WriteFileRes | null>('write_base64_into_file', { filePath, fileContent }), // TODO: not used
	addDir: (dirPath: string) => runIvk<boolean | null>('add_dir', { dirPath }),
	deleteDir: (dirPath: string) => runIvk<boolean | null>('delete_dir', { dirPath }),
	// getDirSize: (dirPath: string) => runIvk<number | null>('get_dir_size', { dirPath }),
	listDirChildren: (dirPath: string) => runIvk<SyncListResItemLocalDisk[] | null>('list_dir_children', { dirPath }),
	rename: (pathOld: string, pathNew: string, isDir: boolean) =>
		runIvk<boolean | null>('rename', { pathOld, pathNew, isDir }),
	// updateFileModifiedTime: (filePath: string, iso8601String: string) =>
	// runIvk<boolean | null>('update_file_modified_time', { filePath, iso8601String }),
	fileInfo: (filePath: string) => runIvk<FileInfo | null>('file_info', { filePath }),
	treeInfo: (dirPath: string) => runIvk<TreeDataNode | null>('tree_info', { dirPath }),
	// walkDirItemsGetPathAndModifyTime: (dirPath: string, filePath: string, excludeDires: string[]) =>
	// 	runIvk<string | null>('walk_dir_items_get_path_and_modify_time', { dirPath, filePath, excludeDires }),
	walkDirItemsGetPath: (dirPath: string, filePath: string, excludeDires: string[]) =>
		runIvk<string[] | null>('walk_dir_items_get_path', { dirPath, filePath, excludeDires }),
	// zipDir: (dirPath: string, filePath: string) => runIvk<boolean | null>('zip_dir', { dirPath, filePath }),
	unzipFile: (filePath: string, dirPath: string) => runIvk<boolean | null>('unzip_file', { dirPath, filePath }),
	searchInDir: (
		dirPath: string,
		isReMode: boolean,
		search: string,
		contextSize: number,
		wrapperPrefix: string,
		wrapperPostfix: string,
		htmlLikeExts: string[],
	) =>
		runIvk<SearchFileRes[] | null>('search_in_dir', {
			dirPath,
			isReMode,
			search,
			contextSize,
			wrapperPrefix,
			wrapperPostfix,
			htmlLikeExts,
		}),
	searchInFile: (
		filePath: string,
		isReMode: boolean,
		search: string,
		contextSize: number,
		wrapperPrefix: string,
		wrapperPostfix: string,
		htmlLikeExts: string[],
	) =>
		runIvk<SearchFileRes[] | null>('search_in_file', {
			filePath,
			isReMode,
			search,
			contextSize,
			wrapperPrefix,
			wrapperPostfix,
			htmlLikeExts,
		}),

	// encrypt_hash
	// Read and write the configuration files.
	encryptStringToFile: (pwd: number[], filePath: string, fileContent: string) =>
		runIvk<WriteFileRes | null>('encrypt_string_into_file', { pwd, filePath, fileContent }),
	decryptFileToString: (pwd: number[], filePath: string) =>
		runIvk<string | null>('decrypt_file_to_string', { pwd, filePath }),
	// Encrypt and decrypt the text files which are set to encrypt when save the content.
	encryptStringArray: (pwd: number[], content: string[]) =>
		runIvk<string[] | null>('encrypt_string_array', { pwd, content }),
	decryptStringArray: (pwd: number[], content: string[]) =>
		runIvk<string[] | null>('decrypt_string_array', { pwd, content }),

	// Read and write the files that users imported.
	encryptLocalFile: (pwd: number[], filePathFrom: string, filePathTo: string) =>
		runIvk<WriteFileRes | null>('encrypt_local_file', { pwd, filePathFrom, filePathTo }),
	encryptLocalFileContentBase64: (pwd: number[], content: number[]) =>
		runIvk<string | null>('encrypt_local_file_content_base64', { pwd, content }),
	// decryptLocalFile: (pwd: number[], filePathFrom: string, filePathTo: string) =>
	// 	runIvk<string | null>('decrypt_local_file', { pwd, filePathFrom, filePathTo }),
	decryptLocalFileBase64: (pwd: number[], filePath: string) =>
		runIvk<string | null>('decrypt_local_file_base64', { pwd, filePath }),
	// sha256ByFilePath: (filePath: string) => runIvk<string | null>('sha256_by_file_path', { filePath }),
	// stringSha256: (str: string) => runIvk<string | null>('string_sha256', { content: str }),
	// stringCrc32: (str: string) => runIvk<number | null>('string_crc32', { content: str }),

	// net
	downloadFile: (
		method: HttpMethod,
		url: string,
		filePath: string,
		headerMap: StringStringObj,
		paramsMap: StringStringObj,
		isLargeFile: boolean,
		progressName: string,
	) =>
		runIvk<boolean | null>('download_file', { method, url, filePath, headerMap, paramsMap, isLargeFile, progressName }),

	httpRequestText: (
		method: HttpMethod,
		url: string,
		body: string,
		headerMap: StringStringObj,
		paramsMap: StringStringObj,
	) => runIvk<HttpResponse | null>('http_request', { method, url, respDataType: 'text', headerMap, paramsMap, body }),
	// httpRequestBase64: (
	// 	method: HttpMethod,
	// 	url: string,
	// 	body: string,
	// 	headerMap: StringStringObj,
	// 	paramsMap: StringStringObj,
	// ) => runIvk<HttpResponse | null>('http_request', { method, url, respDataType: 'base64', headerMap, paramsMap, body }),

	// other
	logInfo: (content: string) => {
		console.info('log info::', content)
		runIvk('log', { level: 'INFO', content })
	},
	// logError: (content: string) => {
	// 	console.error('log error::', content)
	// 	runIvk('log', { level: 'ERROR', content })
	// },
	// logDebug: (content: string) => {
	// 	console.debug('log debug::', content)
	// 	runIvk('log', { level: 'DEBUG', content })
	// },
	// getProgress: (progressName: string) => runIvk<ProgressStatus | null>('get_progress', { progressName }),
	getAppCoreConf: () => runIvk<AppCoreConf>('get_app_core_conf', {}),
	// jsonToToml: (content: string) => runIvk<StringPair | null>('json_to_toml', { content }),
	// tomlToJson: (content: string) => runIvk<StringPair | null>('toml_to_json', { content }),
}
