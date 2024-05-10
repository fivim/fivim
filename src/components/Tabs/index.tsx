import React from 'react'

import { CloseOutlined } from '@ant-design/icons'
import * as RxTabs from '@radix-ui/react-tabs'

import styles from './styles.module.scss'

export type TabArrayItem = {
	key?: string
	label: JSX.Element
	children: JSX.Element
}

export type TabsProp = {
	defaultValue: string
	showCloseBtn: boolean
	onCloseMenu: (event: any) => void
	tabArray: TabArrayItem[]
}

export const Tabs: React.FC<TabsProp> = ({ defaultValue, showCloseBtn, tabArray, onCloseMenu }) => {
	return (
		<RxTabs.Root className={styles.TabsRoot} defaultValue={defaultValue}>
			<RxTabs.List className={styles.TabsList}>
				<div className={styles.Triggers}>
					{tabArray.map((item, index) => (
						<RxTabs.Trigger className={styles.TabsTrigger} value={item.key || `${index}`}>
							{item.label}
						</RxTabs.Trigger>
					))}
				</div>

				{showCloseBtn && (
					<div className={styles.Btns}>
						<span className="pt-1 pr-2 cur-ptr" onClick={onCloseMenu}>
							<CloseOutlined />
						</span>
					</div>
				)}
			</RxTabs.List>

			{tabArray.map((item, index) => (
				<RxTabs.Content className={styles.TabsContent} value={item.key || `${index}`}>
					{item.children}
				</RxTabs.Content>
			))}
		</RxTabs.Root>
	)
}

export default Tabs
