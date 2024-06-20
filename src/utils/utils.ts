import LZString from 'lz-string'

import { PASSWORD_SALT } from '@/constants'

import { sha256 } from './hash'
import { getPageWidth } from './media_query'

// Make a password to encrypt/decrypt file with a salt.
export const genFilePwdWithSalt = (pwdSha256: string, salt: string) => {
	if (pwdSha256 === '') {
		return ''
	}

	return sha256(salt + salt + pwdSha256)
}

export const lzCompress = (str: string) => {
	return LZString.compressToUint8Array(str)
}

export const genPwdVec = (pwdStr: string) => {
	pwdStr = PASSWORD_SALT + pwdStr
	let sss = encodeURIComponent(pwdStr)
	sss = sha256(sss) + sha256(pwdStr) + sha256(sss + pwdStr)
	const u8a = lzCompress(pwdStr)

	let arr = Array.from(u8a)
	while (arr.length < 60) {
		const na = [...arr]
		arr = arr.concat(na)
	}

	return arr
}

export const genPwdArr = (arr: number[]) => {
	let resArr: number[] = []
	if (arr.length < 60) {
		console.error(`genPwdArr' length is too small ${arr.length}`)
		return []
	}

	resArr = [
		arr[9],
		arr[49],
		arr[28],
		arr[3],
		arr[12],
		arr[36],
		arr[54],
		arr[31],
		arr[58],
		arr[19],
		arr[15],
		arr[22],
		arr[24],
		arr[5],
		arr[1],
		arr[37],
		arr[39],
		arr[33],
		arr[50],
		arr[46],
		arr[7],
		arr[38],
		arr[42],
		arr[21],
		arr[26],
		arr[52],
		arr[55],
		arr[23],
		arr[10],
		arr[35],
		arr[56],
		arr[11],
	]

	return resArr
}

// deep copy a data
export const jsonCopy = (data: any) => JSON.parse(JSON.stringify(data))

/** Via https://davidwalsh.name/javascript-debounce-function */
export function debounce(this: unknown, func: any, wait: number, immediate = false) {
	let timeout: NodeJS.Timeout | null
	return (...args: any[]) => {
		const context = this
		// eslint-disable-next-line prefer-rest-params
		const later = () => {
			timeout = null
			if (!immediate) {
				func.apply(context, args)
			}
		}
		const callNow = immediate && !timeout
		if (timeout) {
			clearTimeout(timeout)
		}
		timeout = setTimeout(later, wait)
		if (callNow) {
			func.apply(context, args)
		}
	}
}

export const runInTauri = () => {
	return (
		Object.prototype.hasOwnProperty.call(window, '__TAURI__') ||
		Object.prototype.hasOwnProperty.call(window, '__TAURI_INTERNALS__')
	)
}

export const disableRightCilckAndDevTool = () => {
	// disable right click
	window.oncontextmenu = function (e) {
		e.preventDefault()
	}
	// disable develop tool
	window.onkeydown = function (e) {
		if (e.keyCode === 123) {
			e.preventDefault()
		}
	}
}

export const convertAnythingToString = (val: any) => {
	if (val === null) {
		return 'null'
	}

	if (typeof val === 'undefined') {
		return 'undefined'
	}

	try {
		const jjj = JSON.stringify(val, null, 2)

		return jjj
	} catch (error) {
		if (error instanceof TypeError && error.message.includes('circular structure')) {
			console.error('Circular reference detected, unable to stringify object.')
			return 'Circular Reference'
		}
	}

	return String(val)
}

export const isDebug = () => {
	try {
		// rspack
		if (process.env.NODE_ENV) {
			return process.env.NODE_ENV === 'development'
		}
		// vite
		if (import.meta) {
			// import.meta.env.MODE.startsWith('dev')
			const meta = import.meta as any
			const env = meta.env as any
			env.MODE.startsWith('dev')
		}
	} catch (error) {
		console.error("Function 'isDebug' error, are you using rspack or vite?")
	}

	return false
}

export const genDialogWidth = () => {
	const width = getPageWidth()
	if (width < 768) {
		return '100%'
	} else if (width < 1024) {
		return '95%'
	} else if (width >= 1024) {
		return '50%'
	}
}

export const genDialogWidthSmall = () => {
	const width = getPageWidth()

	if (width >= 1440) {
		return '50%'
	}
	if (width >= 1280) {
		return '60%'
	}
	if (width >= 1024) {
		return '70%'
	}
	if (width >= 768) {
		return '80%'
	}

	return '100%'
}
