import classNames from 'classnames'
import React, { useEffect, useRef, useState } from 'react'

import globalStore from '@/stores/globalStore'
import { tmplMessageLineProps } from '@/types_template'

import styles from './styles.module.scss'

export type MessageLineProps = {
	backgroundColor?: string
	color?: string
	open: boolean
	title: string
	description?: string
	timeout?: number
}

export const MessageLine: React.FC<MessageLineProps> = ({
	backgroundColor,
	color,
	open,
	title,
	description,
	timeout,
}) => {
	const [openTemp, setOpenTemp] = useState(false)
	const timerRef = useRef<number | null>(null)

	useEffect(() => {
		setOpenTemp(open)

		timerRef.current = setTimeout(() => {
			setOpenTemp(false)
			globalStore.setGlobalMessageLineProps(tmplMessageLineProps()) // Reset
		}, timeout || 3000) as unknown as number

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current)
		}
	}, [open, title, description])

	return (
		<>
			{openTemp && (
				<div className={classNames(styles.MessageLineWrapper)}>
					<div
						className={classNames(styles.MessageLine)}
						style={{
							color: color,
							backgroundColor: backgroundColor,
						}}
					>
						<span className={styles.Title}>
							{title} {openTemp}
						</span>
						<span className={styles.Description}>{description}</span>
					</div>
				</div>
			)}
		</>
	)
}
