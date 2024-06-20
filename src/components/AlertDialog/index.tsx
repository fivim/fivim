import classNames from 'classnames'
import React, { useEffect, useState } from 'react'

import * as RxAlertDialog from '@radix-ui/react-alert-dialog'
import { CheckCircledIcon, CircleBackslashIcon, CrossCircledIcon, InfoCircledIcon } from '@radix-ui/react-icons'

import globalStore from '@/stores/globalStore'
import { MessageType } from '@/types'

import styles from './styles.module.scss'

export type AlertDialogProps = {
	open: boolean
	title: string
	description: string
	cancelText: string
	okText: string
	msgType: MessageType
	onReturn?: (value: boolean) => void
}

export type AlertDialogRes = boolean | null

export const AlertDialog: React.FC<AlertDialogProps> = ({
	open,
	title,
	description,
	cancelText,
	okText,
	msgType,
	onReturn,
}) => {
	const [openTemp, setOpenTemp] = useState(open)
	useEffect(() => {
		setOpenTemp(open)
	}, [open, title, description, cancelText, okText, msgType])

	const handleOk = () => {
		globalStore.setGlobalWebAlertDialogRes(true)
		setOpenTemp(false)

		if (onReturn) onReturn(true)
	}

	const handleCancel = () => {
		globalStore.setGlobalWebAlertDialogRes(false)
		setOpenTemp(false)

		if (onReturn) onReturn(false)
	}

	return (
		<RxAlertDialog.Root open={openTemp}>
			<RxAlertDialog.Portal>
				<RxAlertDialog.Overlay className={styles.AlertDialogOverlay} />
				<RxAlertDialog.Content className={styles.AlertDialogContent}>
					<RxAlertDialog.Title className={styles.AlertDialogTitle}>
						{msgType === 'info' && (
							<InfoCircledIcon className={styles.icon} style={{ color: 'var(--fvm-info-clr)' }} />
						)}
						{msgType === 'success' && (
							<CheckCircledIcon className={styles.icon} style={{ color: 'var(--fvm-success-clr)' }} />
						)}
						{msgType === 'error' && (
							<CrossCircledIcon className={styles.icon} style={{ color: 'var(--fvm-danger-clr)' }} />
						)}
						{msgType === 'warning' && (
							<CircleBackslashIcon className={styles.icon} style={{ color: 'var(--fvm-warning-clr)' }} />
						)}

						{title}
					</RxAlertDialog.Title>

					<RxAlertDialog.Description className={styles.AlertDialogDescription}>{description}</RxAlertDialog.Description>
					<div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
						{cancelText && (
							<RxAlertDialog.Cancel asChild>
								<button className={classNames(styles.Button, styles.cancel)} onClick={handleCancel}>
									{cancelText}
								</button>
							</RxAlertDialog.Cancel>
						)}

						{okText && (
							<RxAlertDialog.Action asChild>
								<button className={classNames(styles.Button, styles.ok)} onClick={handleOk}>
									{okText}
								</button>
							</RxAlertDialog.Action>
						)}
					</div>
				</RxAlertDialog.Content>
			</RxAlertDialog.Portal>
		</RxAlertDialog.Root>
	)
}
