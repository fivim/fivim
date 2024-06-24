import { Base64 } from 'js-base64'
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { exsied } from '@exsied/exsied'

import { LOCAL_FILE_LINK_PREFIX } from '@/constants'
import { Func_Empty_Void, Func_String_Void } from '@/types'

import { IMG_BAK_SRC_ATTR_NAME, externalFunctions, updateOutline } from './base'
import { initExsied } from './exsied'
import { processHotKey } from './hot_key'
import './styles.scss'

export type EditorComponentRef = {
	setValue: Func_String_Void
	getValue: () => string
}

interface Props {
	id?: string
	onOpenFile: Func_String_Void
	onSaveFile: Func_Empty_Void
}

export const RichTextEditor = forwardRef<EditorComponentRef, Props>(({ id, onOpenFile, onSaveFile }, ref) => {
	// TODO: onOpenFile, onSaveFile not use ???
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
	}))

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
			initExsied(id)
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
})

const headingAddAttr = (htmlString: string) => {
	const tempDiv = document.createElement('div')
	tempDiv.innerHTML = htmlString
	const headers = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6')

	for (let i = 0; i < headers.length; i++) {
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
