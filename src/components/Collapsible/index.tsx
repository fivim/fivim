import React from 'react'

import * as RxCollapsible from '@radix-ui/react-collapsible'
import { CaretDownIcon, CaretUpIcon } from '@radix-ui/react-icons'

import styles from './styles.module.scss'

export type CollapsibleProp = {
	title: string
	dataArray: JSX.Element[]
}

export const Collapsible: React.FC<CollapsibleProp> = ({ title, dataArray }) => {
	const [open, setOpen] = React.useState(false)

	return (
		<RxCollapsible.Root className={styles.CollapsibleRoot} open={open} onOpenChange={setOpen}>
			<RxCollapsible.Trigger>
				<span className="text-bold">
					{open ? <CaretUpIcon /> : <CaretDownIcon />}
					{title}
				</span>
			</RxCollapsible.Trigger>

			<RxCollapsible.Content>{dataArray.map((item, index) => item)}</RxCollapsible.Content>
		</RxCollapsible.Root>
	)
}

export default Collapsible
