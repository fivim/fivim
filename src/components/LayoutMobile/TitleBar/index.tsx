import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { forwardRef } from 'react'

import { LockOutlined, MenuOutlined, ProfileOutlined, SaveOutlined } from '@ant-design/icons'

import { TYPE_MD, TYPE_SOURCE_CODE, TYPE_XRTM } from '@/constants'
import globalStore from '@/stores/globalStore'
import { Func_Any_Void, Func_Empty_Void } from '@/types'

import styles from './styles.module.scss'

type Props = {
	saveEditorContent: Func_Any_Void
	onShowDrawerTree: Func_Empty_Void
	onShowDrawerOpt: Func_Empty_Void
}

const Titlebar = forwardRef<HTMLDivElement, Props>(({ saveEditorContent, onShowDrawerTree, onShowDrawerOpt }, ref) => {
	const GD = globalStore.getData()

	return (
		<div className={styles.TitleBar}>
			<div className={classNames('flex-space-between', styles.Bar)} data-tauri-drag-region>
				{/* Left drawer button */}
				<div className="disp-flex">
					<span className={styles.Btn}>
						<ProfileOutlined onClick={onShowDrawerTree} />
					</span>

					{(GD.editorType === TYPE_XRTM || GD.editorType === TYPE_MD || GD.editorType === TYPE_SOURCE_CODE) && (
						<span className={styles.btn}>
							<SaveOutlined onClick={saveEditorContent} />
						</span>
					)}
				</div>

				{/* Title */}
				<div style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
					{GD.titlebarShowLockIcon && (
						<span className={classNames('highlight-color', styles.Title)}>
							<LockOutlined />
							{GD.currentFileName || ''}
						</span>
					)}
					{!GD.titlebarShowLockIcon && <span className={styles.Title}>{GD.currentFileName || ''}</span>}
				</div>
				{/* Right drawer button */}
				<div>
					<span className={styles.Btn}>
						<MenuOutlined onClick={onShowDrawerOpt} />
					</span>
				</div>
			</div>
		</div>
	)
})

export default observer(Titlebar)
