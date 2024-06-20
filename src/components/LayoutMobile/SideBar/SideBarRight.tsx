import { Button, Space } from 'antd'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import React from 'react'

import {
	CloseOutlined,
	CloudDownloadOutlined,
	CloudSyncOutlined,
	DeleteOutlined,
	FileProtectOutlined,
	FileTextOutlined,
	NodeIndexOutlined,
	RedoOutlined,
	SettingOutlined,
	UndoOutlined,
	UnlockOutlined,
} from '@ant-design/icons'

import { Settings } from '@/components/Settings'
import { TYPE_MD, TYPE_NONE, TYPE_SOURCE_CODE } from '@/constants'
import i18n from '@/i18n'
import { deleteConfFile } from '@/initialize'
import { invoker } from '@/invoker'
import globalStore from '@/stores/globalStore'
import settingStore from '@/stores/settingStore'
import { syncAdapter } from '@/synchronizer'
import { Func_Any_Void, Func_Empty_Void } from '@/types'
import { isMobileScreen } from '@/utils/media_query'

import styles from './styles.module.scss'

const t = i18n.t
interface Props {
	onCloseMenu: Func_Any_Void
	onDecryptContent: Func_Empty_Void
	onSaveEncrypt: Func_Empty_Void
	onSaveUnencrypt: Func_Empty_Void
	onRestoreContent: Func_Empty_Void
}

const SideBarRight: React.FC<Props> = ({
	onCloseMenu,
	onDecryptContent,
	onSaveEncrypt,
	onSaveUnencrypt,
	onRestoreContent,
}) => {
	const GD = globalStore.getData()
	const SD = settingStore.getData()

	const syncer = syncAdapter()

	const [settingVisible, setSettingVisible] = useState(false)

	const refreshPage = () => {
		invoker.reoladWindow()
	}

	const deleteConf = async () => {
		if (await invoker.confirm(t('Are you sure you want to delete the configuration file?'), t('Warning'))) {
			if (await deleteConfFile()) {
				invoker.success(t('Delete successful'))
			} else {
				invoker.warning(t('Delete successful'))
			}
		}
	}

	const initAsRemote = async () => {
		if (
			await invoker.confirm(
				t('Initializing data from a remote end will result in clearing local data. Are you sure?'),
				t('Warning'),
			)
		) {
			invoker.alert(t('Syncing'))
			const rrr = await syncer.initFromRemoteZip()
			if (rrr.success) {
				invoker.success(t('Sync successful'))
			} else {
				console.error(t('Sync failed'), rrr.errMsg)
				invoker.warning(t('Sync failed'))
			}
		}
	}

	const syncData = async () => {
		invoker.alert(t('Syncing'))
		const rrr = await syncer.sync()
		if (rrr.success) {
			invoker.success(t('Sync successful'))
		} else {
			console.error(t('Sync failed'), rrr.errMsg)
			invoker.warning(t('Sync failed') + '\n' + rrr.errMsg)
		}
	}

	const closeSetting = () => {
		setSettingVisible(false)
	}

	return (
		<>
			<div className="disp-flex pb-4">
				<span style={{ flex: '1' }}>
					<span className="text-bold"> &nbsp; </span>
				</span>
				{/* Close button */}
				<span className="pt-1 pr-2" onClick={onCloseMenu}>
					<CloseOutlined />
				</span>
			</div>

			<div className={classNames('fvm-list')}>
				{GD.currentFilePath.length > 0 && (
					<>
						<div className={styles.ListItem}>
							<div className={styles.Icon}>
								<NodeIndexOutlined />
							</div>
							<div className={styles.Content}>
								<div className="text-break-all">
									{t('Current path')}: {GD.currentFilePath}
								</div>
							</div>
						</div>

						{/* Hide these btns */}
						{((false && GD.editorType === TYPE_MD) || GD.editorType === TYPE_SOURCE_CODE) &&
							!GD.currentFileName.endsWith(SD.encryptedFileExt) && (
								<>
									<div className="group-title">
										<span>{t('File content')}</span>
									</div>
									<div className="action-btn-row">
										<Space wrap>
											<Button
												icon={<UnlockOutlined />}
												onClick={() => {
													onDecryptContent()
												}}
											>
												{t('Try to decrypt the content')}
											</Button>
											<Button
												icon={<FileProtectOutlined />}
												onClick={() => {
													onSaveEncrypt()
												}}
											>
												{t('Encryot on save')}
											</Button>
											<Button
												icon={<FileTextOutlined />}
												onClick={() => {
													onSaveUnencrypt()
												}}
											>
												{t('Not encryot on save')}
											</Button>
											<Button
												icon={<UndoOutlined />}
												onClick={() => {
													onRestoreContent()
												}}
											>
												{t('Revert')}
											</Button>
										</Space>
									</div>
								</>
							)}
					</>
				)}
			</div>

			<div
				className={styles.ListItem}
				onClick={() => {
					setSettingVisible(true)
				}}
			>
				<div className={styles.Icon}>
					<SettingOutlined />
				</div>
				<div className={styles.Content}>{t('Setting')}</div>
			</div>
			<div className={styles.ListItem} onClick={refreshPage}>
				<div className={styles.Icon}>
					<RedoOutlined />
				</div>
				<div className={styles.Content}>{t('Refresh')}</div>
			</div>
			<div className={styles.ListItem} onClick={deleteConf}>
				<div className={styles.Icon}>
					<DeleteOutlined />
				</div>
				<div className={styles.Content}>{t('Reset')}</div>
			</div>

			{SD.sync.mode !== TYPE_NONE && (
				<>
					<div className={styles.ListItem} onClick={syncData}>
						<div className={styles.Icon}>
							<CloudSyncOutlined />
						</div>
						<div className={styles.Content}>{t('Sync')}</div>
					</div>

					<div className={styles.ListItem} onClick={initAsRemote}>
						<div className={styles.Icon}>
							<CloudDownloadOutlined />
						</div>
						<div className={styles.Content}>{t('Initialize from remote end')}</div>
					</div>
				</>
			)}

			<Settings
				showModal={settingVisible}
				onModalOk={closeSetting}
				onModalCancel={closeSetting}
				tabPosition={isMobileScreen() ? 'top' : 'left'}
			/>
		</>
	)
}

export default observer(SideBarRight)
