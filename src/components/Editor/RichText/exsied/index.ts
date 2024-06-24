import { v4 as uuidv4 } from 'uuid'

import { KEY_CTRL, exsied, plugins } from '@exsied/exsied'
import { PluginConf as fontSizePluginConf } from '@exsied/exsied/dist/plugins/font_size/base'
import { PluginConf as aboutPluginConf } from '@exsied/exsied/dist/plugins/source_code/base'
import '@exsied/exsied/style.css'

import { updateOutline } from '../base'
import { highlighCode } from '../highlight'
import ContentTag from './plugins/content_tag'
import LinkTag from './plugins/link_tag'

export const CN_ICON_WITH_BKG = 'exsied-icon-with-bkg'

// sourceCode
const sourceCodeConf = plugins.sourceCode.conf as aboutPluginConf
sourceCodeConf.renderDataCb = (ele: HTMLElement) => {
	const lang = ele.getAttribute('lang') || ''
	const res = highlighCode(ele.innerHTML, lang)
	return `<pre><code>${res}</code></pre>`
}
sourceCodeConf.editDataCb = (ele: HTMLElement, sign: string) => {}
sourceCodeConf.randomCharsCb = () => {
	return uuidv4()
}

// fontSize
const fontSizeConf = plugins.fontSize.conf as fontSizePluginConf
const fontSizeArr = [
	8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 50, 58, 64, 72, 80, 90, 100, 120, 140, 180, 220, 280,
]
for (const item of fontSizeArr) {
	const option = `${item}px`
	let exist = false
	fontSizeConf.fontSizeOptions.map((item) => {
		if (item.name === option) {
			exist = true
		}
	})
	if (exist) continue

	fontSizeConf.fontSizeOptions.push({
		name: option,
		value: option,
		tooltipText: option,
	})
}

export function initExsied(id: string) {
	exsied.init({
		id: id,
		plugins: [
			plugins.redoAndUndo,
			plugins.insertMenu,
			plugins.bold,
			plugins.italic,
			plugins.underline,
			plugins.strikethrough,
			plugins.headings,
			plugins.link,
			plugins.image,
			plugins.table,
			plugins.horizonalRule,
			plugins.quote,
			plugins.lists,
			plugins.fontSize,
			// plugins.fontFamily,
			plugins.textAlign,
			plugins.indentAndOutdent,
			plugins.subscriptAndSupscript,
			plugins.colors,
			plugins.findAndReplace,
			plugins.sourceCode,

			ContentTag,
			LinkTag,
		],
		enableToolbarBubble: true,
		locale: 'en',
		iAbideByExsiedLicenseAndDisableTheAboutPlugin: true,
		hotkeys: [
			{ keyStr: 'b', func: plugins.bold.commands[plugins.bold.name], modifierKeys: [KEY_CTRL] },
			{ keyStr: 'i', func: plugins.italic.commands[plugins.italic.name], modifierKeys: [KEY_CTRL] },
			{
				keyStr: 'u',
				func: plugins.underline.commands[plugins.underline.name],
				modifierKeys: [KEY_CTRL],
			},
		],
		dataAttrs: { sign: 'data-uuid', signOriginal: 'data-origianl-uuid' },
		hooks: {
			onInput: (event) => {
				const ele = event.target as HTMLElement
				updateOutline(ele.innerHTML)
			},
		},
	})
}
