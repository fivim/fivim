import globalStore from '@/stores/globalStore'
import { extractHeadings } from '@/utils/html'

import { OutlineHeading } from './types'

export const IMG_SRC_PREFIX = 'data:app/image;fivim,' // Prefix of src.
export const IMG_SRC_BAK_DATA_ATTR = 'srcbak'

export const LINK_LOCAL_SCHEME = 'fivimfile' // Local file scheme.
export const LINK_LOCAL_PREFIX = LINK_LOCAL_SCHEME + '://'

export const externalFunctions = {
	loadImgBase64: async (src: string) => {
		console.error(`loadImgBase64: ${src}`)
		return '<empty>'
	},
	editorOpenFile: async (_path: string) => {
		console.error(`editorOpenFile: ${_path}`)
		return
	},
}

export const extractHeadingsData = (htmlString: string) => {
	const regex = /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/g

	const matches: OutlineHeading[] = []
	let match

	while ((match = regex.exec(htmlString)) !== null) {
		const level = match[1]
		const content = match[3]
		const text = content.replace('&nbsp;', ' ')

		matches.push({
			level: parseInt(level),
			text,
		})
	}

	return matches
}

export const updateOutline = (html: string) => {
	const headings = extractHeadings(html).join('')
	globalStore.setOutlineHeadings(extractHeadingsData(headings))
}

// If an  a element linked to a local file, add a prefix "fivim.file://" to th href.
export const localLinkSignAdd = (url: string) => {
	if (!(url.startsWith('http://') || url.startsWith('https://') || url.startsWith(LINK_LOCAL_PREFIX))) {
		url = LINK_LOCAL_PREFIX + url
	}

	return url
}

// If a link has a prefix "fivim.file://", remove it.
export const localLinkSignRemove = (url: string) => {
	if (url.startsWith(LINK_LOCAL_PREFIX)) {
		url = url.slice(LINK_LOCAL_PREFIX.length)
	}

	return url
}

export async function htmlAddExtAttr(htmlString: string) {
	const tempDiv = document.createElement('div')
	tempDiv.innerHTML = htmlString

	const imgElements = tempDiv.querySelectorAll('img')
	for (const img of imgElements) {
		let src = img.getAttribute('src') || ''
		img.setAttribute(`data-${IMG_SRC_BAK_DATA_ATTR}`, src)
		src = src.replace(IMG_SRC_PREFIX, '')
		const b64 = await externalFunctions.loadImgBase64(src)
		if (b64 !== '') {
			img.setAttribute('src', b64)
		}
	}

	const linkElements = tempDiv.querySelectorAll('a')
	for (const link of linkElements) {
		const href = link.getAttribute('href') || ''

		if (!href.startsWith(LINK_LOCAL_PREFIX)) {
			link.href = localLinkSignAdd(href)
		}
	}

	return tempDiv.innerHTML
}

export const htmlRemoveExtAttr = (htmlString: string) => {
	const tempDiv = document.createElement('div')
	tempDiv.innerHTML = htmlString
	const imgElements = tempDiv.querySelectorAll('img')
	for (const img of imgElements) {
		const ds = img.dataset
		const sb = ds[IMG_SRC_BAK_DATA_ATTR]

		if (sb) {
			const src = sb.replace(IMG_SRC_PREFIX, '')
			img.setAttribute('src', src)
			img.removeAttribute(`data-${IMG_SRC_BAK_DATA_ATTR}`)
		}
	}

	const linkElements = tempDiv.querySelectorAll('a')
	for (const link of linkElements) {
		const href = link.getAttribute('href') || ''
		if (href.startsWith(LINK_LOCAL_PREFIX)) {
			link.href = href.slice(LINK_LOCAL_PREFIX.length)
		}
	}

	return tempDiv.innerHTML
}
