import { EditorView } from 'codemirror'
import { t } from 'i18next'
import { v4 as uuidv4 } from 'uuid'

import { StateEffect } from '@codemirror/state'
import { CN_TEMP_ELE, DomUtils, KEY_CTRL, PopupView, exsied, plugins } from '@exsied/exsied'
import { EventWithElement } from '@exsied/exsied/dist/core/plugin'
import { PluginConf as fontSizePluginConf } from '@exsied/exsied/dist/plugins/font_size/base'
import { PluginConf as sourceCodePluginConf } from '@exsied/exsied/dist/plugins/source_code/base'
import '@exsied/exsied/style.css'

import { formatHtml } from '@/utils/html'
import { osThemeIsDark } from '@/utils/media_query'

import {
	DEFAULT_DARK_THEME,
	DEFAULT_LIGHT_THEME,
	cmSuppertedLang,
	getLang,
	getThemeByName,
} from '../../CodeMirror/base'
import {
	CodeMirrorOnChange,
	genDefaultThemeOption,
	genExtensions,
	initEditorState,
	initEditorView,
} from '../../CodeMirror/initCodeMirror'
import { updateOutline } from '../base'
import { highlighCode } from '../highlight'
import ContentTag from './plugins/content_tag'
import LinkTag from './plugins/link_tag'

export const CN_ICON_WITH_BKG = 'exsied-icon-with-bkg'
let editorView: EditorView | null

function getExtensions(lang: string, onChange: CodeMirrorOnChange) {
	const defaultThemeOption = genDefaultThemeOption(null, null, null, null, null, null)
	const exts = genExtensions(defaultThemeOption, onChange)

	const theme = osThemeIsDark() ? getThemeByName(DEFAULT_DARK_THEME) : getThemeByName(DEFAULT_LIGHT_THEME)
	exts.push(theme)

	const language = getLang(lang)
	if (language) exts.push(language)
	return exts
}

async function initCodeMirror(str: string, parentEle: HTMLElement, lang: string, onChange: CodeMirrorOnChange) {
	const text = lang === 'html' ? await formatHtml(str) : str
	const state = initEditorState(text, getExtensions(lang, onChange))
	editorView = initEditorView(state, parentEle)
}

// sourceCode
const sourceCodeConf = plugins.sourceCode.conf as sourceCodePluginConf
sourceCodeConf.renderDataCb = (ele: HTMLElement) => {
	const lang = ele.getAttribute('lang') || ''
	const res = highlighCode(ele.innerHTML, lang)
	return `<pre><code>${res}</code></pre>`
}
sourceCodeConf.editDataCb = (codeEle: HTMLElement, sign: string) => {
	const NAME = 'sourceCodeEditor'
	const ID = `exsied_${NAME}_popup`

	const contentHtml = `
		<div>
			<button class="save-btn"> ${t('Save')}</button>
			<select class="language-seleteor">
				${cmSuppertedLang.map((item) => {
					return `<option>${item}</option>`
				})}
			</select>			
		</div>
		<div class="code-mirror-render"></div>
		`

	const ele = PopupView.create({
		id: ID,
		classNames: [CN_TEMP_ELE],
		attrs: { TEMP_EDIT_ID: ID },
		contentClassNames: [NAME],
		contentAttrs: {},
		contentHtml,
		titlebarText: t('Source code editor'),
	})

	ele.style.position = 'absolute'
	ele.style.top = '5vh'
	ele.style.left = '5vw'

	ele.style.height = '90vh'
	ele.style.width = '90vw'

	const lang = codeEle.getAttribute('lang') || ''
	const textContent = codeEle.textContent || ''
	let newTextContent = textContent

	document.body.appendChild(ele)
	DomUtils.limitElementRect(ele)

	const onChange = (param: string) => {
		newTextContent = param
	}

	const saveBtn = ele.querySelector('.save-btn')
	if (saveBtn) {
		saveBtn.addEventListener('click', () => {
			codeEle.textContent = newTextContent
			const cb = plugins.sourceCode.commands['renderCodeEle']
			if (cb) {
				const event = new Event('custom')
				const eventWithElement = {
					...event,
					customElement: codeEle,
				} as EventWithElement

				cb(eventWithElement)
			} else {
				console.error("Cannot call sourceCode.commands['renderCodeEle']")
			}
			ele.remove()
		})
	}
	const seleteor = ele.querySelector('.language-seleteor')
	if (seleteor) {
		seleteor.addEventListener('change', (event) => {
			const target = event.target
			if (target) {
				const targetEle = target as HTMLSelectElement
				const lang = targetEle.value
				if (editorView) {
					const exts = getExtensions(lang, onChange)
					editorView.dispatch({ effects: StateEffect.reconfigure.of(exts) })
				}
			}
		})
	}
	const renderBlk = ele.querySelector('.code-mirror-render')
	if (renderBlk) {
		initCodeMirror(textContent, renderBlk as HTMLElement, lang, onChange)
	}
}
sourceCodeConf.randomCharsCb = () => {
	return uuidv4()
}

sourceCodeConf.toggleSourceViewAferInitCb = async (ele) => {
	ele.contentEditable = 'false'
	const htmlStr = exsied.elements.workplace.innerHTML
	initCodeMirror(htmlStr, ele, 'html', (param) => {
		exsied.elements.workplace.innerHTML = param
	})
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
