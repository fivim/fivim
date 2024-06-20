// import { platform } from '@tauri-apps/plugin-os'// for tauri2.x
// import { runInTauri } from './utils'

export const isIos = async () => {
	// if (runInTauri()) {
	// 	const platformName = await platform()
	// 	return platformName === 'ios'
	// }

	// Refer: https://stackoverflow.com/questions/9038625/detect-if-device-is-ios/9039885#9039885
	return (
		(/iPad|iPhone|iPod/.test(navigator.userAgent) && !Object.prototype.hasOwnProperty.call(window, 'MSStream')) ||
		(navigator.userAgent.includes('Mac') && 'ontouchend' in document && navigator.maxTouchPoints > 1)
	)
}

export const isMacOs = async () => {
	// if (runInTauri()) {
	// 	const platformName = await platform()
	// 	return platformName === 'macos'
	// }

	// Refer: https://stackoverflow.com/questions/10527983/best-way-to-detect-mac-os-x-or-windows-computers-with-javascript-or-jquery
	return navigator.platform.toUpperCase().indexOf('MAC') >= 0
}

export const isAndroid = async () => {
	// if (runInTauri()) {
	// 	const platformName = await platform()
	// 	return platformName === 'android'
	// }

	const ua = navigator.userAgent.toLowerCase()
	return ua.includes('android')
}

export const isUnixLike = async () => {
	// if (runInTauri()) {
	// 	const platformName = await platform()
	// 	return ['linux', 'freebsd', 'dragonfly', 'netbsd', 'openbsd', 'solaris'].indexOf(platformName as string) >= 0
	// }

	const ua = navigator.userAgent.toLowerCase()
	return (
		(ua.includes('linux') ||
			ua.includes('unix') ||
			ua.includes('sunos') ||
			ua.includes('bsd') ||
			ua.includes('gentoo') ||
			ua.includes('freebsd') ||
			ua.includes('openbsd') ||
			ua.includes('netbsd')) &&
		!ua.includes('android')
	)
}

export const isWindows = async () => {
	// if (runInTauri()) {
	// 	const platformName = await platform()
	// 	return platformName === 'windows'
	// }

	const ua = navigator.userAgent.toLowerCase()
	return ua.includes('windows')
}

export const isMobile = async () => {
	return (await isAndroid()) || (await isIos())
}

export const isPc = async () => {
	const res = (await isMacOs()) || (await isWindows()) || (await isUnixLike())
	return res
}
