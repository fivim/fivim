import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { forwardRef, useRef } from 'react'

import { CloseOutlined, ExpandOutlined, LockOutlined, MinusOutlined } from '@ant-design/icons'
import { listen } from '@tauri-apps/api/event'
import { exit } from '@tauri-apps/api/process'
import { appWindow } from '@tauri-apps/api/window'

import { APP_NAME } from '@/constants'
import i18n from '@/i18n'
import { invoker } from '@/invoker'
import runningStore from '@/stores/globalStore'

import styles from './styles.module.scss'

const t = i18n.t
type Props = {
	title: string
	percent: number
}

const Titlebar = forwardRef<HTMLDivElement, Props>(({ title, percent }, ref) => {
	const isMaximized = useRef(false)
	const isResizable = useRef(true)
	const isFullscreen = useRef(false)

	const initState = async () => {
		isMaximized.current = await appWindow.isMaximized()
		isResizable.current = await appWindow.isResizable()
	}
	listen('tauri://resize', async () => {
		isMaximized.current = await appWindow.isMaximized()
	})
	initState()

	const getShadeWidth = () => {
		return (100 - percent).toFixed() + '%'
	}

	// minimize window
	const onWinMin = async () => {
		await appWindow.minimize()
	}

	// toggleMaximize window
	const onWinMax2Min = async () => {
		const resizable = await appWindow.isResizable()
		if (!resizable) {
			return
		}
		await appWindow.toggleMaximize()
		isFullscreen.current = !isFullscreen.current
	}

	// close window
	const onWinClose = async () => {
		const cr = await invoker.confirm(t('Are you sure to exit?'), t('Warning'))
		if (cr) {
			exit()
		}
	}

	return (
		<>
			<div className={styles.Titlebar}>
				<div className={styles.ProcessBar}>
					<div className="pos-rel">
						<div className={styles.Colors}></div>
						<div className={styles.Shade} style={{ width: `${getShadeWidth()}` }}></div>
					</div>
				</div>

				<div className={styles.Content} data-tauri-drag-region>
					<span className={styles.Title}>
						{runningStore.getData().titlebarShowLockIcon && (
							<span className="px-4">
								<LockOutlined style={{ color: 'var(--fvm-highlight-clr)' }} />
							</span>
						)}
						{title && <span>{`${title} - ${APP_NAME}`}</span>}
						{!title && <span>{APP_NAME}</span>}
					</span>
				</div>

				<div className={classNames(styles.Actions, 'disp-flex')}>
					<span className="px-2" onClick={onWinMin}>
						<MinusOutlined />
					</span>
					<span className="px-2" onClick={onWinMax2Min}>
						<ExpandOutlined />
					</span>
					<span className="px-2" onClick={onWinClose}>
						<CloseOutlined />
					</span>
				</div>
			</div>
		</>
	)
})

export default observer(Titlebar)
