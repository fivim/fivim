import { Base64 } from 'js-base64'
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { KEY_CTRL, exsied, plugins } from '@exsied/exsied'
import { PluginConf as fontSizePluginConf } from '@exsied/exsied/dist/plugins/font_size/base'
import { PluginConf as aboutPluginConf } from '@exsied/exsied/dist/plugins/source_code/base'
import '@exsied/exsied/style.css'

import { LOCAL_FILE_LINK_PREFIX } from '@/constants'
import globalStore from '@/stores/globalStore'
import { StringStringObj } from '@/types'
import { extractHeaders } from '@/utils/html'

import { IMG_BAK_SRC_ATTR_NAME, externalFunctions, extractHeadingsData } from './base'
import { highlighCode } from './highlight'
import { processHotKey } from './hot_key'
import './styles.scss'

export type EditorComponentRef = {
	setValue: (str: string) => void
	getValue: () => string
	updateCustomBlockByUuid: (uuid: string, dataJsonStr: string, htmlStr: string, dataSet?: StringStringObj) => any
	removeCustomBlockByUuid: (uuid: string) => any
	renderLocalImg: () => any
}

interface Props {
	id?: string
	name?: string
	onOpenFile: (str: string) => void
	onSaveFile: () => void
	placeholder?: string
	tabIndex?: number
}

export const RtEditor = forwardRef<EditorComponentRef, Props>(
	({ id, name, onOpenFile, onSaveFile, placeholder, tabIndex }, ref) => {
		const parentRef = useRef<HTMLDivElement>(null)
		const editorRef = useRef<HTMLDivElement>(null)

		const setValue = async (str: string) => {
			if (editorRef.current) {
				const html = headingAddAttr(str)
				exsied.setHtml(html)
				updateOutline(html)
				renderLocalImg()
			}
		}

		const getValue = () => {
			if (editorRef.current) {
				const cnt = exsied.getHtml()
				const v = cleanData(cnt)
				return v
			}

			return ''
		}

		useImperativeHandle(ref, () => ({
			setValue,
			getValue,
			updateCustomBlockByUuid,
			removeCustomBlockByUuid,
			renderLocalImg,
		}))

		const updateCustomBlockByUuid = (
			uuid: string,
			dataJsonStr: string,
			previewStr: string,
			dataSet?: StringStringObj,
		) => {
			const blocks = document.querySelectorAll(`.custom-block[data-uuid="${uuid}"]`)
			blocks.forEach((block) => {
				if (dataSet) {
					for (const item in dataSet) {
						block.setAttribute(`data-${item}`, dataSet[item])
					}
				}

				const dataJson = block.querySelector('.dataJson')
				if (dataJson) dataJson.innerHTML = dataJsonStr

				const preview = block.querySelector('.preview')
				if (preview) {
					preview.innerHTML = previewStr
				} else {
					const newDiv = document.createElement('div')
					newDiv.className = 'preview'
					newDiv.innerHTML = previewStr
					block.appendChild(newDiv)
				}
			})
		}

		const renderLocalImg = async () => {
			const matches = document.querySelectorAll(`img`)
			const srcBakAttr = `data-${IMG_BAK_SRC_ATTR_NAME}`

			if (matches) {
				for (let index = 0; index < matches.length; index++) {
					const imgEle = matches[index]
					const src = imgEle.src
					if (src.startsWith(LOCAL_FILE_LINK_PREFIX)) {
						const b64 = await externalFunctions.loadImgBase64(src)

						// Use base64 record decodeURIComponent(src) to keep the orginal string.
						imgEle.setAttribute(srcBakAttr, Base64.encode(decodeURIComponent(src)))
						imgEle.src = b64
					}
				}
			}
		}

		const removeCustomBlockByUuid = (uuid: string) => {
			const blocks = document.querySelectorAll(`.custom-block[data-uuid="${uuid}"]`)
			blocks.forEach((block) => {
				const parent = block.parentNode
				if (parent) parent.removeChild(block)
			})
		}

		const handleClick = (event: MouseEvent) => {
			if (!event.target) return false

			const target = event.target as HTMLDivElement

			// link
			if (target.tagName.toUpperCase() === 'A') {
				event.preventDefault()
				event.stopPropagation()
				return false
			}

			return true
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.shiftKey && event.key === ' ') {
				const selection = window.getSelection()
				if (!(selection && selection.rangeCount > 0)) return

				const range = selection.getRangeAt(0)
				const containerNode = range.startContainer
				const element = containerNode.parentElement
				const text = element?.innerText
				if (!text) return

				const rrr = processHotKey(text)
				const newHtml = rrr.html
				const focusTag = rrr.focusTag
				if (newHtml === text) return

				element.textContent = ''
				element.innerHTML = newHtml.trim()

				// Set cursor to newly added element.
				const firstEle = element.querySelector(focusTag)
				if (firstEle === null) return
				const newRange = document.createRange()
				newRange.setStart(firstEle, 0)
				newRange.setEnd(firstEle, 0)
				// newRange.collapse(true)
				selection.removeAllRanges()
				selection.addRange(newRange)
			}
		}

		useEffect(() => {
			if (editorRef.current && id) {
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

			if (parentRef.current) {
				parentRef.current.addEventListener('click', handleClick)
				parentRef.current.addEventListener('keydown', handleKeyDown)
			}

			return () => {
				if (parentRef.current) {
					parentRef.current.removeEventListener('click', handleClick)
					parentRef.current.removeEventListener('keydown', handleKeyDown)
				}
			}
		}, [])

		return (
			<>
				<div className="rich-editor-wrapper" ref={parentRef}>
					<div id={id} ref={editorRef} />
				</div>
			</>
		)
	},
)

const headingAddAttr = (htmlString: string) => {
	var tempDiv = document.createElement('div')
	tempDiv.innerHTML = htmlString
	var headers = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6')

	for (var i = 0; i < headers.length; i++) {
		if (!headers[i].hasAttribute('data-uuid')) {
			headers[i].setAttribute('data-uuid', uuidv4())
		}
	}

	return tempDiv.innerHTML
}

const cleanData = (htmlString: string) => {
	const parser = new DOMParser()
	const doc = parser.parseFromString(htmlString, 'text/html')

	// Replace img src
	const imgEles = doc.querySelectorAll('img')
	const imgDataAttr = `data-${IMG_BAK_SRC_ATTR_NAME}`
	imgEles.forEach((ele) => {
		if (ele.hasAttribute(imgDataAttr)) {
			const srcBak = ele.getAttribute(imgDataAttr)
			if (srcBak) {
				ele.setAttribute('src', Base64.decode(srcBak))
				ele.removeAttribute(imgDataAttr)
			}
		}
	})

	// Remove .preview
	const previewEles = doc.querySelectorAll('.preview')
	if (previewEles) {
		previewEles.forEach((ele) => {
			const parent = ele.parentNode
			if (parent) parent.removeChild(ele)
		})
	}

	return doc.body.innerHTML
}

const updateOutline = (html: string) => {
	const headings = extractHeaders(html).join('')
	globalStore.setOutlineHeadings(extractHeadingsData(headings))
}
