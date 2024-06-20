import { observer } from 'mobx-react-lite'
import React from 'react'

import { BarsOutlined, PartitionOutlined } from '@ant-design/icons'

import FileTree from '@/components/FileTree'
import Outline from '@/components/Outline'
import Tabs, { TabArrayItem } from '@/components/Tabs'
import { TAB_FILE_TREE, TAB_OUTLINE } from '@/constants'
import i18n from '@/i18n'
import { Func_Empty_Void, Func_String_Void } from '@/types'

const t = i18n.t
interface Props {
	onOpenFile: Func_String_Void
	onModifyFile: Func_Empty_Void
	onCloseMenu: Func_Empty_Void
}

const SideBarLeft: React.FC<Props> = ({ onOpenFile, onCloseMenu, onModifyFile }) => {
	const tabArray: TabArrayItem[] = [
		{
			key: TAB_FILE_TREE,
			label: <PartitionOutlined />,
			children: (
				<FileTree
					onOpenFile={onOpenFile}
					onCloseMenu={onCloseMenu}
					onReloadMenu={function (): void {}}
					onModifyFile={onModifyFile}
					showCloseBtn={false}
				/>
			),
		},
		{
			key: TAB_OUTLINE,
			label: <BarsOutlined />,
			children: (
				<Outline
					onClick={function (event: any): void {
						onCloseMenu()
					}}
				/>
			),
		},
	]

	return (
		<>
			<Tabs
				defaultValue={TAB_FILE_TREE}
				tabArray={tabArray}
				showCloseBtn={true}
				onCloseMenu={(event) => {
					onCloseMenu()
				}}
			/>
		</>
	)
}

export default observer(SideBarLeft)
