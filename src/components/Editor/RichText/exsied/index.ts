import { KEY_CTRL, exsied, plugins } from '@exsied/exsied'
import '@exsied/exsied/style.css'

import { updateOutline } from '../base'
import { reconfFontSize } from './plugin_conf/fontSize'
import { reconfLink } from './plugin_conf/link'
import { reconfSourceCode } from './plugin_conf/sourceCode'
import ContentTag from './plugins/content_tag'
import LinkTag from './plugins/link_tag'

export const CN_ICON_WITH_BKG = 'exsied-icon-with-bkg'

reconfFontSize()
reconfLink()
reconfSourceCode()

export const initExsied = (id: string) => {
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
