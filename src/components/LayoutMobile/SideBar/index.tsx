import { Drawer } from 'antd'
import { observer } from 'mobx-react-lite'
import { forwardRef } from 'react'

import runningStore from '@/stores/globalStore'
import { Func_Empty_Void, Func_String_Void } from '@/types'

import SideBarLeft from './SideBarLeft'
import SidebarOpt from './SideBarRight'

type Props = {
	onOpenFile: Func_String_Void
	onFileTreeOpened: Func_Empty_Void
	onDecryptContent: Func_Empty_Void
	onSaveEncrypt: Func_Empty_Void
	onSaveUnencrypt: Func_Empty_Void
	onRestoreContent: Func_Empty_Void
}

const Sidebars = forwardRef<HTMLDivElement, Props>(
	({ onOpenFile, onFileTreeOpened, onDecryptContent, onSaveEncrypt, onSaveUnencrypt, onRestoreContent }, ref) => {
		const onCloseMenuTree = () => {
			runningStore.setOpenMenuTree(false)
		}

		const onCloseMenuOpt = () => {
			runningStore.setOpenMenuOpt(false)
		}

		return (
			<>
				{/* File tree drawer button on the left. */}
				<Drawer onClose={onCloseMenuTree} open={runningStore.data.openMenuTree} placement="left">
					<SideBarLeft onOpenFile={onOpenFile} onCloseMenu={onCloseMenuTree} onModifyFile={onFileTreeOpened} />
				</Drawer>

				{/* Operation drawer button on the right. */}
				<Drawer onClose={onCloseMenuOpt} open={runningStore.data.openMenuOpt} placement="right">
					<SidebarOpt
						onCloseMenu={onCloseMenuOpt}
						onDecryptContent={onDecryptContent}
						onSaveEncrypt={onSaveEncrypt}
						onSaveUnencrypt={onSaveUnencrypt}
						onRestoreContent={onRestoreContent}
					/>
				</Drawer>
			</>
		)
	},
)

export default observer(Sidebars)
