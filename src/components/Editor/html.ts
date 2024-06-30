import { decode } from 'he'
import { marked } from 'marked'

import globalStore from '@/stores/globalStore'
import { removeHtmlTags } from '@/utils/html'

import { OutlineHeading } from './RichText/types'

export const IMG_SRC_PREFIX = 'data:app/image;fivim,' // Prefix of src.
export const IMG_SRC_BAK_DATA_ATTR = 'srcbak'

export const LINK_LOCAL_SCHEME = 'fivimfile' // Local file scheme.
export const LINK_LOCAL_PREFIX = LINK_LOCAL_SCHEME + '://'
export const DATA_ATTR_LINE = 'data-fivim-line'

marked.use({
	// https://marked.js.org/using_pro#renderer
	renderer: {
		code(text: string, lang: string | undefined, escaped: boolean) {
			let langString = (lang || '').match(/^\S*/)?.[0]
			langString = encodeURIComponent(langString || '')

			let code = text.replace(/\n$/, '') + '\n'
			code = dataLineRemove(code)

			// const codeEleContent = escaped ? code : encodeURIComponent(code)
			const codeEleContent = code
			let codeEleAttrs = langString ? ` class="language-${langString}'"` : ''
			codeEleAttrs = ` lang=${langString}` + codeEleAttrs

			return `<pre><code ${codeEleAttrs}>${codeEleContent}</code></pre>\n`
		},
	},
})

const dataLineRemove = (text: string) => {
	const pattern = /<span data-fivim-line="\d+"><\/span>/g
	const result = text.replace(pattern, '')

	return result
}

function dataLineAdd(text: string): string {
	const lines = text.split('\n')
	const resultLines = lines.map((line, index) =>
		line.trim() === '' ? `\n<span ${DATA_ATTR_LINE}="${index}"></span>` : line,
	)

	return resultLines.join('\n')
}

export const md2html = async (mdStr: string) => {
	const md = dataLineAdd(mdStr)
	const htmlString = marked.parse(md) as string
	return htmlString
}

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
	const regex = /<(h[1-6])(?:\s+[^>]*)?>([\s\S]*?)<\/\1>/gm

	const matches: OutlineHeading[] = []
	let match

	while ((match = regex.exec(htmlString)) !== null) {
		const level = match[1]
		const content = match[2]
		let text = decode(content)
		text = removeHtmlTags(text)

		matches.push({
			level: parseInt(level.replace('h', '')),
			text,
		})
	}

	return matches
}

export const updateOutline = (html: string) => {
	globalStore.setOutlineHeadings(extractHeadingsData(html))
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

export const cleanNoneTextEle = (parentEle: HTMLElement, selector: string) => {
	const eles = parentEle.querySelectorAll(selector)
	for (const ele of eles) {
		if (ele.textContent === '') ele.remove()
	}
}

export async function htmlAddExtAttr(htmlString: string) {
	const tempDiv = document.createElement('div')
	tempDiv.innerHTML = htmlString

	for (const slt of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) {
		cleanNoneTextEle(tempDiv, slt)
	}

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
