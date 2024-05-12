import classNames from 'classnames'
import { Jodit } from 'jodit'
import { Base64 } from 'js-base64'
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { LOCAL_FILE_LINK_PREFIX } from '@/constants'
import { TYPE_NONE } from '@/constants'
import i18n from '@/i18n'
import globalStore from '@/stores/globalStore'
import { StringStringObj } from '@/types'
import { isMobileScreen, osThemeIsDark } from '@/utils/media_query'
import { extractHeaders } from '@/utils/string'

import {
	EDITOR_CLASS_NAME,
	IMG_BAK_SRC_ATTR_NAME,
	TOOLBAR_BUTTON_ARRAY,
	customJoditInit,
	externalFunctions,
	extractHeadingsData,
} from './base'
import { BlockEleDataSet, CustomBlockComponentRef, CustomBlockType } from './custom_block'
import { processHotKey } from './hot_key'
import CodeBlock from './plugins/code-block/CodeBlock'
import { TYPE_CODE_BLOCK } from './plugins/code-block/base'
import './styles.scss'

const t = i18n.t

export type EditorComponentRef = {
	setValue: (str: string) => void
	getValue: () => string
	updateCustomBlockByUuid: (uuid: string, dataJsonStr: string, htmlStr: string, dataSet?: StringStringObj) => any
	removeCustomBlockByUuid: (uuid: string) => any
	renderLocalImg: () => any
	renderCustomBlock: () => any
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
		const editorRef = useRef<HTMLTextAreaElement>(null)
		const editor = useRef<Jodit | null>(null)

		const codeBlockRef = useRef<CustomBlockComponentRef>(null)

		const [blockType, setBlockType] = useState<CustomBlockType>(TYPE_NONE)
		const [blockContent, setBlockContent] = useState('')

		const [blockEditingUuid, setBlockEditingUuid] = useState('')
		const [blockEditingContent, setBlockEditingContent] = useState('')

		const setValue = async (str: string) => {
			setBlockType(TYPE_NONE)

			if (editor.current) {
				const html = headingAddAttr(str)
				editor.current.value = html
				renderLocalImg()
				renderCustomBlock()
			}
		}

		const getValue = () => {
			if (editor.current) {
				const cnt = editor.current.value
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
			renderCustomBlock,
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

		const renderCustomBlock = () => {
			const blocks = document.querySelectorAll(`.custom-block`)
			blocks.forEach((block) => {
				const ele = block as HTMLElement
				const eleDataset = ele.dataset as BlockEleDataSet
				const dataJsonEle = ele.querySelector('.dataJson')
				const blockType = eleDataset.type

				// CODE_BLOCK
				if (blockType === TYPE_CODE_BLOCK && codeBlockRef.current && dataJsonEle) {
					const rd = codeBlockRef.current.genBlockRenderData(eleDataset, dataJsonEle.innerHTML)
					updateCustomBlockByUuid(eleDataset.uuid, rd.dataJsonStr, rd.innerHTML)
				}
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

			// custom-block
			const cbEle = target.closest('.custom-block')
			if (cbEle) {
				const blockType = cbEle.getAttribute('data-type')

				// CODE_BLOCK
				if (blockType == TYPE_CODE_BLOCK && codeBlockRef.current) {
					codeBlockRef.current.clickHandler(target, cbEle)
				}
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
				newRange.collapse(true)
				const selectionN = window.getSelection()
				if (selectionN === null) return
				selectionN.removeAllRanges()
				selectionN.addRange(newRange)
			}

			if (event.altKey) {
				// Heading 1 - 6
				if (event.key === '0') editor.current?.execCommand('formatBlock', false, 'p')
				if (event.key === '1') editor.current?.execCommand('formatBlock', false, 'h1')
				if (event.key === '2') editor.current?.execCommand('formatBlock', false, 'h2')
				if (event.key === '3') editor.current?.execCommand('formatBlock', false, 'h3')
				if (event.key === '4') editor.current?.execCommand('formatBlock', false, 'h4')
				if (event.key === '5') editor.current?.execCommand('formatBlock', false, 'h5')
				if (event.key === '6') editor.current?.execCommand('formatBlock', false, 'h6')
			}
		}

		useEffect(() => {
			if (editorRef.current) {
				customJoditInit()

				// all options from https://xdsoft.net/jodit/docs/,
				editor.current = Jodit.make(editorRef.current, {
					autofocus: true,
					uploader: {
						insertImageAsBase64URI: true,
					},
					className: classNames(EDITOR_CLASS_NAME),
					theme: osThemeIsDark() ? 'dark' : '',
					buttons: TOOLBAR_BUTTON_ARRAY,
					enter: 'div',
					enterBlock: 'div',
					events: {
						afterInit: () => console.info('afterInit'),
						change: (data: any) => {
							const headings = extractHeaders(data).join('')
							globalStore.setOutlineHeadings(extractHeadingsData(headings))
						},
					},
					disablePlugins: isMobileScreen() ? 'powered-by-jodit' : '',
					placeholder: placeholder || '...',
					readonly: false,
					tabIndex: 1,
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

		useEffect(() => {
			if (editor.current?.workplace) {
				editor.current.workplace.tabIndex = tabIndex || -1
			}
		}, [tabIndex])

		return (
			<>
				<div className="rich-editor-wrapper" ref={parentRef}>
					<textarea name={name} id={id} ref={editorRef} />
				</div>

				<CodeBlock
					ref={codeBlockRef}
					blockType={blockType}
					setBlockType={setBlockType}
					blockContent={blockContent}
					setBlockContent={setBlockContent}
					blockEditingUuid={blockEditingUuid}
					setBlockEditingUuid={setBlockEditingUuid}
					blockEditingContent={blockEditingContent}
					setBlockEditingContent={setBlockEditingContent}
					onRemoveCustomBlockByUuid={removeCustomBlockByUuid}
					onUpdateCustomBlockByUuid={updateCustomBlockByUuid}
				/>
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
