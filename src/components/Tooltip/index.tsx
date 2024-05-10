import React, { ReactNode } from 'react'

import * as RxTooltip from '@radix-ui/react-tooltip'

import styles from './styles.module.scss'

export const Tooltip = React.forwardRef<HTMLButtonElement, { title: string; children: ReactNode }>(
	({ title, children }, ref) => {
		return (
			<RxTooltip.Provider delayDuration={100}>
				<RxTooltip.Root>
					<RxTooltip.Trigger ref={ref} asChild>
						<span className={styles.TooltipTrigger}>{children}</span>
					</RxTooltip.Trigger>
					<RxTooltip.Portal>
						<RxTooltip.Content sideOffset={10}>{title}</RxTooltip.Content>
					</RxTooltip.Portal>
				</RxTooltip.Root>
			</RxTooltip.Provider>
		)
	},
)
