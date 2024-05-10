import { Tooltip } from 'antd'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { forwardRef, useState } from 'react'
import styled from 'styled-components'

import {
	CloudDownloadOutlined,
	CloudSyncOutlined,
	FileProtectOutlined,
	FileTextOutlined,
	LogoutOutlined,
	ProfileOutlined,
	ReadOutlined,
	SaveOutlined,
	SettingOutlined,
	UndoOutlined,
	UnlockOutlined,
} from '@ant-design/icons'

import { Settings } from '@/components/Settings'
import { TAB_FILE_TREE, TAB_OUTLINE, TAB_SAVE, TYPE_MD, TYPE_NONE, TYPE_SOURCE_CODE } from '@/constants'
import i18n from '@/i18n/index'
import { invoker } from '@/invoker'
import globalStore from '@/stores/globalStore'
import settingStore from '@/stores/settingStore'
import { syncAdapter, syncIsEnabled } from '@/synchronizer'
import { isMobileScreen } from '@/utils/media_query'

import { TabId } from '../types'
import styles from './styles.module.scss'

const t = i18n.t
type Props = {
	tabId: TabId
	saveEditorContent: (event: any) => void
	onDecryptContent: (event: any) => void
	onSaveEncrypt: (event: any) => void
	onSaveUnencrypt: (event: any) => void
	onRestoreContent: (event: any) => void
	onSyncFinished: () => void
	toggleTab: (tab: TabId) => void
	className?: string
}

const Container = styled.div``

const iconStyle = {
	padding: `var(--enas-desktop-activity-bar-padding)`,
	fontSize: `var(--enas-desktop-activity-bar-icon-size)`,
}

const ActivityBar = forwardRef<HTMLDivElement, Props>(
	(
		{
			tabId,
			saveEditorContent,
			onDecryptContent,
			onSaveEncrypt,
			onSaveUnencrypt,
			onRestoreContent,
			onSyncFinished,
			toggleTab,
			className,
		},
		ref,
	) => {
		const GD = globalStore.getData()
		const SD = settingStore.getData()

		const syncer = syncAdapter()
		const tabPosition = isMobileScreen() ? 'top' : 'left'

		const [settingVisible, setSettingVisible] = useState(false)
		const closeSetting = () => {
			setSettingVisible(false)
		}

		const initAsRemote = async () => {
			if (
				await invoker.confirm(
					t('Initializing data from a remote end will result in clearing local data. Are you sure?'),
					'Warning',
				)
			) {
				if (syncIsEnabled()) invoker.alert(t('Syncing'))
				const rrr = await syncer.initFromRemoteZip()
				if (rrr.success) {
					invoker.success(t('Sync successful'))
					onSyncFinished()
				} else {
					console.error(t('Sync failed'), rrr.errMsg)
					invoker.warning(t('Sync failed'))
				}
			}
		}

		const syncData = async () => {
			if (syncIsEnabled()) invoker.alert(t('Syncing'))
			const rrr = await syncer.sync()
			if (rrr.success) {
				invoker.success(t('Sync successful'))
				onSyncFinished()
			} else {
				console.error(t('Sync failed'), rrr.errMsg)
				invoker.warning(t('Sync failed') + '\n' + rrr.errMsg)
			}
		}

		const refreshPage = () => {			
			window.location.reload()
		}

		return (
			<>
				<Container className={classNames(styles.ActivityBar, className)} data-tauri-drag-region>
					<Tooltip placement="right" title={t('File tree')}>
						<div
							className={classNames(styles.Item, tabId === TAB_FILE_TREE ? styles.Active : '')}
							onClick={() => {
								toggleTab(TAB_FILE_TREE)
							}}
						>
							<ProfileOutlined style={iconStyle} />
						</div>
					</Tooltip>

					<Tooltip placement="right" title={t('Outline')}>
						<div
							className={classNames(styles.Item, tabId === TAB_OUTLINE ? styles.Active : '')}
							onClick={() => {
								toggleTab(TAB_OUTLINE)
							}}
						>
							<ReadOutlined style={iconStyle} />
						</div>
					</Tooltip>

					<Tooltip placement="right" title={t('Save')}>
						<div
							className={classNames(styles.Item, tabId === TAB_SAVE ? styles.Active : '')}
							onClick={saveEditorContent}
						>
							<SaveOutlined style={iconStyle} />
						</div>
					</Tooltip>

					{/* Hide these btns */}
					{((false && GD.editorType === TYPE_MD) || GD.editorType === TYPE_SOURCE_CODE) &&
						!GD.currentFileName.endsWith(SD.encryptedFileExt) && (
							<>
								<Tooltip placement="right" title={t('Try to decrypt the content')}>
									<div className={classNames(styles.Item, styles.TextAction)} onClick={onDecryptContent}>
										<UnlockOutlined style={iconStyle} />
									</div>
								</Tooltip>
								<Tooltip placement="right" title={t('Encryot on save')}>
									<div className={classNames(styles.Item, styles.TextAction)} onClick={onSaveEncrypt}>
										<FileProtectOutlined style={iconStyle} />
									</div>
								</Tooltip>
								<Tooltip placement="right" title={t('Not encryot on save')}>
									<div className={classNames(styles.Item, styles.TextAction)} onClick={onSaveUnencrypt}>
										<FileTextOutlined style={iconStyle} />
									</div>
								</Tooltip>
								<Tooltip placement="right" title={t('Revert')}>
									<div className={classNames(styles.Item, styles.TextAction)} onClick={onRestoreContent}>
										<UndoOutlined style={iconStyle} />
									</div>
								</Tooltip>
							</>
						)}

					{SD.sync.mode !== TYPE_NONE && (
						<>
							<Tooltip placement="right" title={t('Sync')}>
								<div className={classNames(styles.Item)} onClick={syncData}>
									<CloudSyncOutlined style={iconStyle} />
								</div>
							</Tooltip>
							<Tooltip placement="right" title={t('Initialize from remote end')}>
								<div className={classNames(styles.Item)} onClick={initAsRemote}>
									<CloudDownloadOutlined style={iconStyle} />
								</div>
							</Tooltip>
						</>
					)}

					<Tooltip placement="right" title={t('Logout')}>
						<div className={classNames(styles.Item)} onClick={refreshPage}>
							<LogoutOutlined style={iconStyle} />
						</div>
					</Tooltip>

					<Tooltip placement="right" title={t('Setting')}>
						<div
							className={classNames(styles.Item)}
							onClick={() => {
								setSettingVisible(true)
							}}
						>
							<SettingOutlined style={iconStyle} />
						</div>
					</Tooltip>
				</Container>

				<Settings
					showModal={settingVisible}
					onModalOk={closeSetting}
					onModalCancel={closeSetting}
					tabPosition={tabPosition}
				/>
			</>
		)
	},
)

export default observer(ActivityBar)
