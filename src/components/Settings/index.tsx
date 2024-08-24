import { Checkbox, Form, Input, Modal, Select, Tabs } from 'antd'
import type { TabsProps } from 'antd'
import classNames from 'classnames'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { APP_VERSION, AVAILABLE_THEMES } from '@/constants'
import { languagesOptions } from '@/i18n'
import { saveConfToFile } from '@/initialize'
import settingStore from '@/stores/settingStore'
import { SYNC_MODE_OPTIONS, TYPE_GITEE_API_V5, TYPE_GITLAB_API } from '@/synchronizer/constants'
import { SyncMode } from '@/synchronizer/types'
import { Func_Any_Void } from '@/types'
import { resetDarkMode, setDarkMode, setTheme } from '@/utils/html'

import styles from './styles.module.scss'
import globalStore from '@/stores/globalStore'

type TabPosition = 'left' | 'right' | 'top' | 'bottom'
interface Props {
	showModal: boolean
	onModalOk: Func_Any_Void
	onModalCancel: Func_Any_Void
	tabPosition: TabPosition
}

export const Settings: React.FC<Props> = ({ showModal, onModalOk, onModalCancel, tabPosition }) => {
	const { t, i18n } = useTranslation()
	const SD = settingStore.getData()

	const [themeName, setThemeName] = useState(SD.theme)
	const onChangeTheme = (themeName: string) => {
		setThemeName(themeName)
		setTheme(themeName)
	}

	const [encryptedFileExt, setEncryptedFileExt] = useState(SD.encryptedFileExt)
	const [forceDarkMode, setForceDarkMode] = useState(SD.forceDarkMode)

	const [syncMode, setSyncMode] = useState<SyncMode>(SD.sync.mode)
	const handleChangeSyncMode = (value: string) => {
		setSyncMode(value as SyncMode)
	}

	const gitlabApiSonf = settingStore.getData().sync.conf.gitlabApi
	const giteeApiSonf = settingStore.getData().sync.conf.giteeApi

	const handleOk = (event: any) => {
		settingStore.setEncryptedFileExt(encryptedFileExt)
		settingStore.setTheme(themeName)
		settingStore.setSyncMode(syncMode)
		settingStore.setSyncConfGitlabApi(gitlabApiSonf)
		settingStore.setForceDarkMode(forceDarkMode)

		saveConfToFile()

		onModalOk(event)
	}

	const handleCancel = (event: any) => {
		onModalCancel(event)
	}

	const changeLanguage = (lng: string) => {
		settingStore.setLocale(lng)
		i18n.changeLanguage(lng)
	}

	// Normal
	const tab1 = (
		<>
			<Form name="Normal">
				<Form.Item label={t('Language')}>
					<Select
						defaultValue={i18n.language}
						options={languagesOptions}
						onChange={changeLanguage}
						style={{ width: '100%' }}
					/>
				</Form.Item>
				<Form.Item label={t('user_files directory')}>
					<Input disabled defaultValue={globalStore.data.paths.userFiles || t('Unset')} />
				</Form.Item>

				<Form.Item label={t('Extension of encrypted file')}>
					<Input
						defaultValue={encryptedFileExt || t('Unset')}
						addonBefore="."
						onChange={(value) => {
							setEncryptedFileExt(value.target.value)
						}}
					/>
				</Form.Item>
			</Form>

			<div>
				{t('Version')}: {APP_VERSION}
			</div>
			<div>
				{t('Document')}: <span>https://fivim.top</span>
			</div>
		</>
	)

	// Appearance
	const tab2 = (
		<Form name="Appearance">
			<Checkbox
				defaultChecked={forceDarkMode}
				onChange={(e) => {
					e.target.checked ? setDarkMode() : resetDarkMode()
					setForceDarkMode(e.target.checked)
				}}
			>
				{t('Force use of dark mode')}
			</Checkbox>

			<Form.Item label={t('Theme')}>
				<div className={classNames('fvm-list cur-ptr pl-4', styles.ThemeSelector)}>
					{AVAILABLE_THEMES.map((item, index) => (
						<div
							className={styles.ListItem}
							key={item}
							onClick={() => {
								onChangeTheme(item)
							}}
						>
							<div className="disp-flex">
								<div
									className={classNames(
										'disp-flex',
										'flex-grow',
										themeName === item ? ' text-bold highlight-color' : '',
									)}
								>
									{item}
								</div>
								<div className="disp-flex flex-grow justify-content-right">
									<div className={styles.ThemeColorBoxGroup}>
										<div
											className={styles.ThemeColorBox}
											style={{ backgroundColor: `var(--fvm-bg-color_${item})` }}
										></div>
										<div
											className={styles.ThemeColorBox}
											style={{ backgroundColor: `var(--fvm-text-color_${item})` }}
										></div>
										<div
											className={styles.ThemeColorBox}
											style={{ backgroundColor: `var(--fvm-highlight-color_${item})` }}
										></div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</Form.Item>
		</Form>
	)

	// Sync
	const tab3 = (
		<Form name="Sync">
			<Select
				defaultValue={syncMode}
				options={SYNC_MODE_OPTIONS}
				onChange={handleChangeSyncMode}
				style={{ width: '100%' }}
			/>

			{syncMode === TYPE_GITEE_API_V5 && (
				<div className="pt-2">
					<Form.Item label={'owner'}>
						<Input
							defaultValue={giteeApiSonf.owner}
							onChange={(e) => {
								giteeApiSonf.owner = e.target.value
							}}
						/>
					</Form.Item>
					<Form.Item label={'repo'}>
						<Input
							defaultValue={giteeApiSonf.repo}
							onChange={(e) => {
								giteeApiSonf.repo = e.target.value
							}}
						/>
					</Form.Item>
					<Form.Item label={t('Token')}>
						<Input
							defaultValue={giteeApiSonf.token}
							onChange={(e) => {
								giteeApiSonf.token = e.target.value
							}}
						/>
					</Form.Item>
					<Form.Item label={t('Branch')}>
						<Input
							defaultValue={giteeApiSonf.branch}
							onChange={(e) => {
								giteeApiSonf.branch = e.target.value
							}}
						/>
					</Form.Item>
				</div>
			)}

			{syncMode === TYPE_GITLAB_API && (
				<div className="pt-2">
					<Form.Item label={t('Site URL')}>
						<Input
							defaultValue={gitlabApiSonf.siteUrl}
							onChange={(e) => {
								gitlabApiSonf.siteUrl = e.target.value
							}}
							placeholder={t('For example: ___name___', { name: 'https://xxx.xxx.com' })}
						/>
					</Form.Item>
					<Form.Item label={t('Token')}>
						<Input
							defaultValue={gitlabApiSonf.token}
							onChange={(e) => {
								gitlabApiSonf.token = e.target.value
							}}
						/>
					</Form.Item>
					<Form.Item label={t('Project ID')}>
						<Input
							defaultValue={gitlabApiSonf.projectId}
							onChange={(e) => {
								gitlabApiSonf.projectId = e.target.value
							}}
						/>
					</Form.Item>
					<Form.Item label={t('Branch')}>
						<Input
							defaultValue={gitlabApiSonf.branch}
							onChange={(e) => {
								gitlabApiSonf.branch = e.target.value
							}}
						/>
					</Form.Item>
				</div>
			)}
		</Form>
	)

	const items: TabsProps['items'] = [
		{
			key: '1',
			label: t('Normal'),
			children: tab1,
		},
		{
			key: '2',
			label: t('Appearance'),
			children: tab2,
		},
		{
			key: '3',
			label: t('Sync'),
			children: tab3,
		},
	]

	return (
		<>
			<Modal
				title={t('Setting')}
				okText={t('OK')}
				cancelText={t('Cancel')}
				open={showModal}
				onOk={handleOk}
				onCancel={handleCancel}
				className="mfcw"
				style={{ overflowX: 'hidden', overflowY: 'scroll' }}
			>
				<Tabs className="mfcw" defaultActiveKey="1" tabPosition={tabPosition} items={items} />
			</Modal>
		</>
	)
}
