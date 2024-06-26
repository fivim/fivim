import globalStore from '@/stores/globalStore'
import { extractHeadings } from '@/utils/html'

import { OutlineHeading } from './types'

export const IMG_BAK_SRC_ATTR_NAME = 'bak-src'

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
