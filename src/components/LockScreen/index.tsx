import { Button, Form, Input } from 'antd'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'

import { UnlockOutlined } from '@ant-design/icons'

import { APP_NAME } from '@/constants'
import i18n from '@/i18n'
import { tryToInitConfFileByPwd } from '@/initialize'
import { invoker } from '@/invoker'
import globalStore from '@/stores/globalStore'
import passwordStore from '@/stores/passwordStore'
import { genPwdVec } from '@/utils/utils'

import styles from './styles.module.scss'

const t = i18n.t
const LockScreen: React.FC = () => {
	const GD = globalStore.getData()

	const [password, setPassword] = useState('')

	const checkPassword = async () => {
		// Try to decrypt the configuration files, if errors occured, show the error message.
		const pwdVec = genPwdVec(password)
		const icf = await tryToInitConfFileByPwd(pwdVec)
		if (!icf) {
			invoker.showMessage('', t('Invalid password'), 'error', false)
		} else {
			globalStore.setLockscreen(false)
			globalStore.setData(GD)
			passwordStore.setData(password)
			setPassword('')

			invoker.logInfo('Unlock succeeded.')
		}
	}

	return (
		<div className={classNames(styles.LockScreen, 'mfcw')}>
			<div className="text-align-center">
				<div className={styles.AppName}>{APP_NAME}</div>
				<Form>
					<Form.Item>
						<Input.Password
							autoFocus
							onChange={(e) => {
								setPassword(e.target.value)
							}}
							type="password"
						/>
					</Form.Item>

					<Form.Item>
						<Button
							onClick={() => {
								checkPassword()
							}}
							htmlType="submit"
						>
							<UnlockOutlined />
							{t('Unlock')}
						</Button>
					</Form.Item>
				</Form>
			</div>
		</div>
	)
}

export default observer(LockScreen)
