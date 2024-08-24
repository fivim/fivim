import { PopupView } from '@exsied/exsied'

import { StringStringObj } from '@/types'

export const getEleContentSize = (element: HTMLElement) => {
	const computedStyle = window.getComputedStyle(element)

	const parseSpacing = (properties: string[]): number => {
		return properties.reduce((sum, property) => {
			const value = parseInt(computedStyle.getPropertyValue(property), 10)
			return isNaN(value) ? sum : sum + value
		}, 0)
	}

	const rect = element.getBoundingClientRect()

	// padding
	const paddingInlineStarts = parseSpacing(['padding-inline-start', 'padding-left'])
	const paddingInlineEnds = parseSpacing(['padding-inline-end'])
	const paddingBlockStarts = parseSpacing(['padding-block-start', 'padding-top'])
	const paddingBlockEnds = parseSpacing(['padding-block-end', 'padding-bottom'])

	const effectivePaddingLeft = computedStyle.direction === 'rtl' ? paddingInlineEnds : paddingInlineStarts
	const effectivePaddingRight = computedStyle.direction === 'rtl' ? paddingInlineStarts : paddingInlineEnds

	// border
	const borderInlineStarts = parseSpacing(['border-inline-start-width', 'border-left-width'])
	const borderInlineEnds = parseSpacing(['border-inline-end-width'])
	const borderBlockStarts = parseSpacing(['border-block-start-width', 'border-top-width'])
	const borderBlockEnds = parseSpacing(['border-block-end-width', 'border-bottom-width'])

	// margin
	const marginLeft = parseSpacing(['margin-inline-start', 'margin-left'])
	const marginRight = parseSpacing(['margin-inline-end', 'margin-right'])
	const marginTop = parseSpacing(['margin-top'])
	const marginBottom = parseSpacing(['margin-bottom'])

	// width and height
	const contentWidth = rect.width - effectivePaddingLeft - effectivePaddingRight - borderInlineStarts - borderInlineEnds
	const contentHeight = rect.height - paddingBlockStarts - paddingBlockEnds - borderBlockStarts - borderBlockEnds

	return {
		width: contentWidth,
		height: contentHeight,
		margin: { left: marginLeft, right: marginRight, top: marginTop, bottom: marginBottom },
	}
}

export const findVisibleEleRange = (selector: string) => {
	const spans = document.querySelectorAll(selector)

	let highestEle: HTMLElement | null = null
	let lowestEle: HTMLElement | null = null

	for (const span of spans) {
		const spanEle = span as HTMLElement
		const rect = spanEle.getBoundingClientRect()

		if (highestEle === null) {
			if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
				highestEle = spanEle as HTMLElement
				continue
			}
		}

		if (lowestEle === null) {
			if (rect.bottom > window.innerHeight) {
				lowestEle = spanEle as HTMLElement
				break
			}
		}
	}

	return {
		highestEle,
		lowestEle,
	}
}

export type showPopupParam = {
	id: string
	classNames: string[]
	attrs: StringStringObj
	titlebarText?: string
	contentClassNames: string[]
	contentAttrs: StringStringObj
	contentHtml: string
	top?: string
	left?: string
	height?: string
	width?: string
}

export const showPopup = (param: showPopupParam) => {
	const ele = PopupView.create({
		id: param.id,
		classNames: param.classNames,
		attrs: param.attrs,
		contentClassNames: param.contentClassNames,
		contentAttrs: param.contentAttrs,
		contentHtml: param.contentHtml,
		titlebarText: param.titlebarText,
	})

	ele.style.position = 'absolute'
	ele.style.top = param.top || '0'
	ele.style.left = param.left || '0'

	if (param.height) ele.style.height = param.height
	if (param.width) ele.style.width = param.width

	return ele
}
