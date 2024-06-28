import dateUtil from 'date-and-time'

import { EXT_IMAGE } from '@/constants'
import globalStore from '@/stores/globalStore'

export const fileToBase64 = (file: File) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.readAsDataURL(file)
		reader.onload = () => resolve(reader.result)
		reader.onerror = (error) => reject(error)
	})
}

export const formatDateTime = (dt: Date, fmt: string): string => {
	const timeFormat = fmt
	return dateUtil.format(dt, timeFormat)
}

/**
 * format string with params object, a little like **Template Literals**
 *
 * usage:
 * ```js
 * const a = 123
 * const str = '>>> ${aa} <<<'
 * const aaa = formatStringWithParams(str, { aa: a })
 * console.log('aaa >> ', aaa)
 * ```
 */
export const formatStringWithParams = (str: string, paramObj: object): string => {
	const names = Object.keys(paramObj)
	const vals = Object.values(paramObj)
	// eslint-disable-next-line no-new-func
	return new Function(...names, `return \`${str}\`;`)(...vals)
}

/**
 * Convert byte array to string
 * @param {byte[]} arr
 * @returns {string}
 */
export const byteToString = (arr: number[]): string => {
	if (typeof arr === 'string') {
		return arr
	}
	let str = ''
	const _arr = arr
	for (let i = 0; i < _arr.length; i++) {
		const one = _arr[i].toString(2)
		const v = one.match(/^1+?(?=0)/)
		if (v && one.length === 8) {
			const bytesLength = v[0].length
			let store = _arr[i].toString(2).slice(7 - bytesLength)
			for (let st = 1; st < bytesLength; st++) {
				store += _arr[st + i].toString(2).slice(2)
			}
			str += String.fromCharCode(parseInt(store, 2))
			i += bytesLength - 1
		} else {
			str += String.fromCharCode(_arr[i])
		}
	}
	return str
}

/**
 * stringToByte: convert string to byte[]
 * @param {string} str
 * @returns {number[]}
 */
export const stringToByte = (str: string): number[] => {
	const bytes = []
	let c
	for (let i = 0; i < str.length; i++) {
		c = str.charCodeAt(i)
		if (c >= 0x010000 && c <= 0x10ffff) {
			bytes.push(((c >> 18) & 0x07) | 0xf0)
			bytes.push(((c >> 12) & 0x3f) | 0x80)
			bytes.push(((c >> 6) & 0x3f) | 0x80)
			bytes.push((c & 0x3f) | 0x80)
		} else if (c >= 0x000800 && c <= 0x00ffff) {
			bytes.push(((c >> 12) & 0x0f) | 0xe0)
			bytes.push(((c >> 6) & 0x3f) | 0x80)
			bytes.push((c & 0x3f) | 0x80)
		} else if (c >= 0x000080 && c <= 0x0007ff) {
			bytes.push(((c >> 6) & 0x1f) | 0xc0)
			bytes.push((c & 0x3f) | 0x80)
		} else {
			bytes.push(c & 0xff)
		}
	}
	return bytes
}

export const stringToUint8Array = (str: string): Uint8Array => {
	return new TextEncoder().encode(str)
}

export const Uint8ArrayToString = (arr: Uint8Array): string => {
	return new TextDecoder('utf-8').decode(arr)
}

export const removeEnding = (str: string, char: string) => {
	if (str.endsWith(char)) {
		str = str.substr(0, str.length - char.length)
	}
	return str
}

export const getFileNameExt = (fileName: string) => {
	return fileName.split('.').pop() || ''
}

export const getFileName = (filePath: string, sep: string) => {
	if (sep === '') sep = globalStore.data.paths.separator
	return filePath.split(sep).pop() || ''
}
export const getFileNameFromUrl = (url: string) => {
	let res = url

	const arr = url.split('/')
	if (arr) {
		const sss = arr.pop()
		if (sss) {
			res = sss.split('?')[0]
		}
	}

	return res
}

export const getDirByFilePath = (filePath: string, sep: string) => {
	if (sep === '') sep = globalStore.data.paths.separator
	const arr = filePath.split(sep)
	arr.pop()
	return arr.join(sep)
}

export const appendToDirPathStr = (dirPath: string, postfix: string) => {
	if (dirPath.endsWith(globalStore.data.paths.separator)) {
		dirPath = dirPath.substr(0, dirPath.length - 1)
	}
	return dirPath + postfix
}

export const fileNameIsImage = (fileName: string) => {
	return EXT_IMAGE.indexOf(getFileNameExt(fileName).toLowerCase()) > -1
}

export const insertStringAt = (str: string, index: number, newSubStr: string) => {
	return str.slice(0, index) + newSubStr + str.slice(index)
}
