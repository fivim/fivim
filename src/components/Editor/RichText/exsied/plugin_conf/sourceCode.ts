import ace from 'ace-builds'
import { t } from 'i18next'
import { v4 as uuidv4 } from 'uuid'

import { CN_TEMP_ELE, DomUtils, PopupView, exsied, plugins } from '@exsied/exsied'
import { EventWithElement } from '@exsied/exsied/dist/core/plugin'
import { PluginConf as SourceCodePluginConf } from '@exsied/exsied/dist/plugins/source_code/base'

import { initAceEditor } from '@/components/Editor/Ace'
import { DEFAULT_DARK_THEME, DEFAULT_LIGHT_THEME, languageOption, themesOptions } from '@/components/Editor/Ace/base'
import { CN_ACTIONS } from '@/constants'
import { getEleContentSize, showPopup } from '@/utils/dom'
import { osThemeIsDark } from '@/utils/media_query'

import { highlighCode } from '../../highlight'

const CN_ACE_RENDER = 'ace-render'
const CN_LANG_SELECTOT = 'language-seleteor'
const CN_THEME_SELECTOT = 'theme-seleteor'

export function reconfSourceCode() {
	const sourceCodeConf = plugins.sourceCode.conf as SourceCodePluginConf
	sourceCodeConf.renderDataCb = (ele: HTMLElement) => {
		const lang = ele.getAttribute('lang') || ''
		const res = highlighCode(ele.innerHTML, lang)
		return `<pre><code>${res}</code></pre>`
	}
	sourceCodeConf.editDataCb = (codeEle: HTMLElement, sign: string) => {
		const contentHtml = `
		<div class="${CN_ACTIONS}">
			<button class="save-btn"> ${t('Save')}</button>
			<select class="${CN_LANG_SELECTOT}">
				${languageOption.map((item, index) => {
					return `<option value="${item.value}">${item.label}</option>`
				})}
			</select>
			<select class="${CN_THEME_SELECTOT}">
				${themesOptions.map((item, index) => {
					return `<option value="${item.value}">${item.label}</option>`
				})}
			</select>
		</div>
		<div class="${CN_ACE_RENDER}"></div>
		`

		const NAME = 'sourceCodeEditor'
		const ID = `exsied_${NAME}_popup`

		const ele = showPopup({
			id: ID,
			classNames: [CN_TEMP_ELE],
			attrs: { TEMP_EDIT_ID: ID },
			titlebarText: t('Source code editor'),
			contentAttrs: {},
			contentClassNames: [NAME],
			contentHtml: contentHtml,
			height: '100vh',
			width: '100vw',
		})

		const lang = codeEle.getAttribute('lang') || ''
		const textContent = codeEle.textContent || ''
		let currentLang = lang
		let newTextContent = textContent

		document.body.appendChild(ele)
		DomUtils.limitElementRect(ele)

		let editor: ace.Ace.Editor | null = null

		const saveBtn = ele.querySelector('.save-btn')
		if (saveBtn) {
			saveBtn.addEventListener('click', () => {
				codeEle.textContent = newTextContent
				const render = plugins.sourceCode.commands['renderCodeEle']
				if (render) {
					const event = new Event('')
					const eventWithElement = {
						...event,
						customElement: codeEle,
					} as EventWithElement

					codeEle.setAttribute('lang', currentLang.replace('ace/mode/', ''))

					render(eventWithElement)
				} else {
					console.error("Cannot call sourceCode.commands['renderCodeEle']")
				}

				ele.remove()
			})
		}

		const sltLang = ele.querySelector(`.${CN_LANG_SELECTOT}`)
		if (sltLang) {
			const seleteorEle = sltLang as HTMLSelectElement
			seleteorEle.value = 'ace/mode/' + lang

			sltLang.addEventListener('change', (event) => {
				const target = event.target
				if (target) {
					const targetEle = target as HTMLSelectElement
					const lang = targetEle.value
					currentLang = lang
					if (editor) editor.session.setMode(lang)
				}
			})
		}

		const sltTheme = ele.querySelector(`.${CN_THEME_SELECTOT}`)
		if (sltTheme) {
			sltTheme.addEventListener('change', (event) => {
				const target = event.target
				if (target) {
					const targetEle = target as HTMLSelectElement
					const val = targetEle.value
					if (editor) editor.setTheme(val)
				}
			})
		}

		const actionBlk = ele.querySelector(`.${CN_ACTIONS}`)
		if (!actionBlk) return
		const actionBlkEle = actionBlk as HTMLElement

		const titlebar = ele.querySelector(`.exsied-popup-titlebar`)
		if (!titlebar) return
		const titlebarEle = titlebar as HTMLElement

		const renderBlk = ele.querySelector(`.${CN_ACE_RENDER}`)
		if (renderBlk) {
			const renderBlkEle = renderBlk as HTMLElement
			const size = getEleContentSize(ele)
			const rectTitlebarEle = titlebarEle.getBoundingClientRect()
			const rectActionsEle = actionBlkEle.getBoundingClientRect()
			renderBlkEle.style.height = `${size.height - rectTitlebarEle.height - rectActionsEle.height - 10}px` // TODO:

			editor = initAceEditor(renderBlk)
			editor.session.setValue(textContent)
			editor.session.setMode('ace/mode/' + lang)
			editor.on('change', (_delta) => {
				newTextContent = editor ? editor.getValue() : ''
			})

			const seleteorEle = sltTheme as HTMLSelectElement
			const theme = osThemeIsDark() ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME
			seleteorEle.value = theme
			if (editor != null) editor.setTheme(theme)
		}
	}
	sourceCodeConf.randomCharsCb = () => {
		return uuidv4()
	}

	sourceCodeConf.toggleSourceViewAferInitCb = async (ele) => {
		ele.contentEditable = 'false'
		const htmlStr = exsied.elements.workplace.innerHTML

		const editor = initAceEditor(ele)
		editor.setValue(htmlStr)
		editor.session.setMode('ace/mode/html')
		editor.on('change', (_delta) => {
			exsied.elements.workplace.innerHTML = editor.getValue()
		})
	}
}
