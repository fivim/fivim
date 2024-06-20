import { removeHtmlTags } from '@/utils/html'

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
		const text = removeHtmlTags(content).replace('&nbsp;', ' ')

		let uuidAttr = ''
		const dataAbdRegex = /data-uuid="([^"]*)"/
		const dataAbdMatch = match[2].match(dataAbdRegex)
		if (dataAbdMatch) {
			uuidAttr = dataAbdMatch[1]
		}

		matches.push({ level: level, text, uuid: uuidAttr })
	}

	return matches
}
