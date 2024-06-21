import React from 'react'

import { ChevronDownIcon } from '@radix-ui/react-icons'
import * as RxSelect from '@radix-ui/react-select'

import { Tooltip } from '../Tooltip'
import styles from './styles.module.scss'

export const SelectItem = React.forwardRef<
	HTMLDivElement | null,
	{ className?: string; children: React.ReactNode; value: string }
>(({ children, className = styles.SelectItem, ...props }, forwardedRef) => {
	return (
		<RxSelect.Item {...props} ref={forwardedRef} className={className}>
			<RxSelect.ItemText>{children}</RxSelect.ItemText>
		</RxSelect.Item>
	)
})

export const SelectTrigger: React.FC<{ title: string; placeholder: string }> = ({ title, placeholder }) => {
	return (
		<Tooltip title={title}>
			<RxSelect.Trigger aria-label={placeholder} className={styles.SelectTrigger} data-toolbar-item={true}>
				<RxSelect.Value placeholder={placeholder} />
				<RxSelect.Icon className={styles.SelectDropdownArrow}>
					<ChevronDownIcon />
				</RxSelect.Icon>
			</RxSelect.Trigger>
		</Tooltip>
	)
}

export const SelectContent: React.FC<{ children: React.ReactNode; selectMaxHeight?: string }> = ({
	children,
	selectMaxHeight,
}) => {
	const style = selectMaxHeight ? { maxHeight: selectMaxHeight, overflow: 'scroll' } : {}
	return (
		<RxSelect.Portal>
			<RxSelect.Content
				className={styles.SelectContainer}
				onCloseAutoFocus={(e) => e.preventDefault()}
				position="popper"
				style={style}
			>
				<RxSelect.Viewport data-editor-dropdown={true}>{children}</RxSelect.Viewport>
			</RxSelect.Content>
		</RxSelect.Portal>
	)
}

export const SELECT_SEPARATOR = 'separator'

/**
 * A toolbar primitive you can use to build dropdowns, such as the block type select.
 * @group Toolbar Primitives
 */
export const Select = <T extends string>(props: {
	value: T
	onChange: (value: T) => void
	triggerTitle: string
	placeholder: string
	items: ({ label: string | JSX.Element; value: T } | typeof SELECT_SEPARATOR)[]
	selectMaxHeight?: string
}) => {
	return (
		<RxSelect.Root value={props.value || undefined} onValueChange={props.onChange}>
			<SelectTrigger title={props.triggerTitle} placeholder={props.placeholder} />
			<SelectContent selectMaxHeight={props.selectMaxHeight}>
				{props.items.map((item, index) => {
					if (item === SELECT_SEPARATOR) {
						return <RxSelect.Separator key={index} className={styles.SelectSeparator} />
					}
					return (
						<SelectItem key={index} value={item.value}>
							{item.label}
						</SelectItem>
					)
				})}
			</SelectContent>
		</RxSelect.Root>
	)
}
