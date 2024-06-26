export function getEleContentSize(element: HTMLElement) {
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
