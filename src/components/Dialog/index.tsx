import classNames from 'classnames'
import React from 'react'

import * as RxDialog from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'

import styles from './styles.module.scss'

export type ButtonPosition = 'start' | 'end' | 'center'

interface Props {
	animate?: boolean
	buttonPosition?: ButtonPosition
	cancelCallback?: () => any
	cancelText?: string
	children: React.ReactNode
	childrenExtButton?: React.ReactNode
	description?: string
	okCallback?: () => any
	okText?: string
	open: boolean
	title?: string
}

const Dialog: React.FC<Props> = ({
	animate,
	buttonPosition,
	cancelCallback,
	cancelText,
	children,
	childrenExtButton,
	description,
	okCallback,
	okText,
	open,
	title,
}) => {
	return (
		<RxDialog.Root open={open}>
			<RxDialog.Portal>
				<RxDialog.Overlay className={classNames(styles.DialogOverlay, animate ? styles.Animate : '')} />
				<RxDialog.Content className={classNames(styles.DialogContent, animate ? styles.Animate : '')}>
					<RxDialog.Title className={styles.DialogTitle}>{title}</RxDialog.Title>
					<RxDialog.Description className={styles.DialogDescription}>{description}</RxDialog.Description>

					{children}

					<div
						className={classNames(
							styles.ButtonGroup,
							buttonPosition === 'start' ? styles.start : '',
							buttonPosition === 'end' ? styles.end : '',
							buttonPosition === 'center' ? styles.center : '',
						)}
					>
						{childrenExtButton}

						<RxDialog.Close asChild>
							<button className={classNames(styles.Button, styles.Cancel)} onClick={cancelCallback}>
								{cancelText}
							</button>
						</RxDialog.Close>

						<RxDialog.Close asChild>
							<button className={classNames(styles.Button, styles.Ok)} onClick={okCallback}>
								{okText}
							</button>
						</RxDialog.Close>
					</div>

					<RxDialog.Close asChild>
						<button className={styles.IconButton} aria-label="Close" onClick={cancelCallback}>
							<Cross2Icon />
						</button>
					</RxDialog.Close>
				</RxDialog.Content>
			</RxDialog.Portal>
		</RxDialog.Root>
	)
}
export default Dialog
