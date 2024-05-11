import { Jodit } from 'jodit'
import 'jodit/es2021/jodit.fat.min.css'
import { Config } from 'jodit/esm/config'
import 'jodit/esm/langs/zh_cn'
import 'jodit/esm/plugins/add-new-line/add-new-line'
import 'jodit/esm/plugins/add-new-line/add-new-line'
import 'jodit/esm/plugins/class-span/class-span'
import 'jodit/esm/plugins/clean-html/clean-html'
import 'jodit/esm/plugins/clipboard/clipboard'
import 'jodit/esm/plugins/copy-format/copy-format'
import 'jodit/esm/plugins/drag-and-drop-element/drag-and-drop-element'
import 'jodit/esm/plugins/drag-and-drop/drag-and-drop'
import 'jodit/esm/plugins/dtd/dtd'
import 'jodit/esm/plugins/file/file'
import 'jodit/esm/plugins/focus/focus'
import 'jodit/esm/plugins/fullsize/fullsize'
import 'jodit/esm/plugins/hr/hr'
import 'jodit/esm/plugins/image-processor/image-processor'
import 'jodit/esm/plugins/image-properties/image-properties'
import 'jodit/esm/plugins/indent/indent'
import cells from 'jodit/esm/plugins/inline-popup/config/items/cells'
import jodit from 'jodit/esm/plugins/inline-popup/config/items/iframe'
import img from 'jodit/esm/plugins/inline-popup/config/items/img'
import toolbar from 'jodit/esm/plugins/inline-popup/config/items/toolbar'
import 'jodit/esm/plugins/justify/justify'
import 'jodit/esm/plugins/key-arrow-outside/key-arrow-outside'
import 'jodit/esm/plugins/limit/limit'
import 'jodit/esm/plugins/line-height/line-height'
import 'jodit/esm/plugins/media/media'
import 'jodit/esm/plugins/mobile/mobile'
import 'jodit/esm/plugins/paste-from-word/paste-from-word'
import 'jodit/esm/plugins/paste-storage/paste-storage'
import 'jodit/esm/plugins/paste/paste'
import 'jodit/esm/plugins/preview/preview'
import 'jodit/esm/plugins/print/print'
import 'jodit/esm/plugins/resize-cells/resize-cells'
import 'jodit/esm/plugins/resize-handler/resize-handler'
import 'jodit/esm/plugins/resizer/resizer'
import 'jodit/esm/plugins/search/search'
import 'jodit/esm/plugins/search/search'
import 'jodit/esm/plugins/select-cells/select-cells'
import 'jodit/esm/plugins/select/select'
import 'jodit/esm/plugins/source/source'
import 'jodit/esm/plugins/speech-recognize/speech-recognize'
import 'jodit/esm/plugins/spellcheck/spellcheck'
import 'jodit/esm/plugins/spellcheck/spellcheck'
import 'jodit/esm/plugins/sticky/sticky'
import 'jodit/esm/plugins/symbols/symbols'
import 'jodit/esm/plugins/tab/tab'
import 'jodit/esm/plugins/table-keyboard-navigation/table-keyboard-navigation'
import 'jodit/esm/plugins/video/video'
import 'jodit/esm/plugins/xpath/xpath'
import { IControlType, IDictionary } from 'jodit/esm/types'

import { removeHtmlTags } from '@/utils/string'

import './plugins/format-block/format-block'
import a from './plugins/inline-popup/config/items/a'

/**
 * Modify the link eye button
 */
import { OutlineHeading } from './types'

const modifyA = () => {
	;(Config.prototype as any).popup = {
		a,
		img,
		cells,
		toolbar,
		jodit,
		iframe: jodit,
		'jodit-media': jodit,
		selection: [
			'bold',
			'underline',
			'italic',
			'ul',
			'ol',
			'\n',
			'outdent',
			'indent',
			'fontsize',
			'brush',
			'cut',
			'\n',
			'paragraph',
			'link',
			'align',
			'dots',
		],
	} as IDictionary<Array<IControlType | string>>
}

/**
 * Add Heading 5 and Heading 6
 */
const addHeading5_6 = () => {
	;(Config.prototype as any).controls.paragraph.list = Jodit.atom({
		p: 'Paragraph',
		h1: 'Heading 1',
		h2: 'Heading 2',
		h3: 'Heading 3',
		h4: 'Heading 4',
		h5: 'Heading 5',
		h6: 'Heading 6',
		blockquote: 'Quote',
		// pre: 'Code',
		code: 'Source code',
	})
}

/**
 * Hot key
 */
const addHotKey = () => {
	;(Config.prototype as any).commandToHotkeys = {
		removeFormat: ['alt+p'], // plain text
		insertOrderedList: ['alt+7'],
		insertUnorderedList: ['alt+8'],
	}
}

export const customJoditInit = () => {
	modifyA()
	addHeading5_6()
	addHotKey()
}

export const TOOLBAR_BUTTON_ARRAY = [
	{
		group: 'history',
		buttons: [],
	},
	{
		group: 'font-style',
		buttons: [],
	},
	{
		group: 'list',
		buttons: [],
	},
	{
		group: 'font',
		buttons: [],
	},
	{
		group: 'indent',
		buttons: [],
	},
	{
		group: 'script',
		buttons: [],
	},
	'\n',
	{
		group: 'state',
		buttons: [],
	},
	{
		group: 'clipboard',
		buttons: [],
	},
	{
		group: 'color',
		buttons: [],
	},
	{
		group: 'insert',
		buttons: [],
	},
	{
		group: 'media',
		buttons: [],
	},
	{
		group: 'form',
		buttons: [],
	},

	{
		group: 'search',
		buttons: [],
	},
	{
		group: 'source',
		buttons: [],
	},
	'---',
	// {
	// 	group: 'other',
	// 	buttons: [],
	// },
	// {
	// 	group: 'info',
	// 	buttons: [],
	// },
]

export const EDITOR_CLASS_NAME = 'joditor'
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

	let matches: OutlineHeading[] = []
	let match

	while ((match = regex.exec(htmlString)) !== null) {
		let level = match[1]
		let content = match[3]
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
