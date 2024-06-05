import { Alert, Button, Form, Input, Select } from 'antd'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'

import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'

import { AVAILABLE_THEMES, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/constants'
import i18n from '@/i18n'
import { saveConfToFile } from '@/initialize'
import globalStore from '@/stores/globalStore'
import passwordStore from '@/stores/passwordStore'
import settingStore from '@/stores/settingStore'
import { genMasterPasswordSha256 } from '@/utils/hash'
import { setTheme } from '@/utils/html'

import styles from './styles.module.scss'

const t = i18n.t
const checkPasswordLength = (pwd: string) => {
	return pwd.length >= PASSWORD_MIN_LENGTH && pwd.length <= PASSWORD_MAX_LENGTH
}

const SetupWizard: React.FC = () => {
	const SD = settingStore.getData()
	const GD = globalStore.getData()

	const [errorMsg, setErrorMsg] = useState('')
	const [themeName, setThemeName] = useState('default')
	const [password, setPassword] = useState('')
	const [encryptedFileExt, setEncryptedFileExt] = useState('enc')

	const getThemeOptions = () => {
		const res = []
		for (const i of AVAILABLE_THEMES) {
			res.push({
				label: i,
				value: i,
			})
		}
		return res
	}

	const onChangeTheme = (newTheme: string) => {
		setThemeName(newTheme)
		setTheme(newTheme)
	}

	const onSave = async () => {
		if (!checkPasswordLength(password)) {
			setErrorMsg(
				t('Password length should between ___min___ to ___max___', {
					min: PASSWORD_MIN_LENGTH,
					max: PASSWORD_MAX_LENGTH,
				}),
			)
			return
		}

		globalStore.setExistConfigFile(true)

		SD.encryptedFileExt = encryptedFileExt
		SD.passwordSum = genMasterPasswordSha256(password)
		SD.theme = themeName
		SD.userFilesDir = GD.pathOfUserFilesDefult

		if (GD.isMobileOs) {
			SD.userFilesDir = GD.pathOfUserFilesDefult
		}

		passwordStore.setData(password)
		settingStore.setData(SD)

		saveConfToFile()
		globalStore.setExistConfigFile(true)
	}

	return (
		<div className={classNames(styles.SetupWizard, 'mfcw')}>
			<div className="p-4">
				<div className="highlight-color ts-12 pb-4">{t('Setup wizard')}</div>

				<Form>
					<Form.Item label={t('Theme')}>
						<Select
							defaultValue={themeName}
							options={getThemeOptions()}
							onChange={(value, option) => {
								onChangeTheme(value)
							}}
						/>
					</Form.Item>

					<Form.Item label={t('Password')}>
						<Input.Password
							onChange={(e) => {
								setPassword(e.target.value)
							}}
							iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
						/>
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

					{errorMsg && (
						<div className="p-2 w-full">
							<Alert message={errorMsg} type="error" />;
						</div>
					)}

					<Button
						type="primary"
						onClick={() => {
							onSave()
						}}
					>
						{t('Confirm')}
					</Button>
				</Form>
			</div>
		</div>
	)
}

export default observer(SetupWizard)
