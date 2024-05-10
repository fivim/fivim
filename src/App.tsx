import { observer } from 'mobx-react-lite'
import React from 'react'

import { AlertDialog } from '@/components/AlertDialog'
import DesktopLayout from '@/components/LayoutDesktop'
import DesktopTitlebar from '@/components/LayoutDesktop/TitleBar'
import Loading from '@/components/Loading'
import LockScreen from '@/components/LockScreen'
import { MessageLine } from '@/components/MessageLine'
import SetupWizard from '@/components/SetupWizard'
import i18n from '@/i18n'
import { checkConfFileExist, initCoreConf, initStartUpConfFile } from '@/initialize'
import { invoker } from '@/invoker'
import globalStore from '@/stores/globalStore'
import settingStore from '@/stores/settingStore'
import '@/styles/index.scss'
import { SYNC_LOCK_FILE_NAME } from '@/synchronizer/constants'
import { tmplAlertDialogProps } from '@/types_template'
import { isMobileScreen, isPcScreen, osThemeIsDark } from '@/utils/media_query'
import { isMobile, isPc, isWindows } from '@/utils/os'
import { pathJoin } from '@/utils/tauri_like'
import { insertStyleSheet, runInTauri } from '@/utils/utils'

const t = i18n.t

const init = async () => {
	const GD = globalStore.getData()

	globalStore.setIsMobile(await isMobile())
	globalStore.setIsPc(await isPc())
	globalStore.setIsMobileScreen(isMobileScreen())
	globalStore.setIsPcScreen(isPcScreen())
	globalStore.setRunInTauri(runInTauri())

	globalStore.setPathSeparator((await isWindows()) ? '\\' : '/')
	globalStore.setIsMobile(await isMobile())

	document.documentElement.classList.add(osThemeIsDark() ? 'dark' : 'light')
	if (GD.isPcOs) insertStyleSheet(`body {border: 1px solid var(--enas-border-clr);}`)

	// if (isDebug() && GD.isPcOs) {
	// 	disableRightCilckAndDevTool()
	// }

	const icc = await initCoreConf()
	if (!icc) return false

	await initStartUpConfFile()
	await checkConfFileExist()

	globalStore.setAppIsLoading(false)

	// Check sync lock file
	const ef = await invoker.existFile(await pathJoin(settingStore.getUserFilesDir(), SYNC_LOCK_FILE_NAME))
	if (ef) {
		invoker.alert(t('Found synchronization lock file, please resynchronize to ensure data integrity.'))
		return false
	}
}

globalStore.setAppIsLoading(true)

setTimeout(() => {
	init()
		.then(() => {})
		.catch((e) => {
			console.log('Init error: ', e)
		})
}, 100)

const App: React.FC = () => {
	const GD = globalStore.getData()

	return (
		<>
			<div className={GD.textDirection === 'RTL' ? 'direction-rtl' : ''}>
				{GD.appIsLoading && <Loading />}
				{!GD.appIsLoading && (
					<>
						{GD.isPcScreen && <DesktopTitlebar title={GD.titlebarText} percent={0} />}

						{!GD.existConfigFile && <SetupWizard />}
						{GD.existConfigFile && (
							<>
								{GD.lockscreen && <LockScreen />}
								{!GD.lockscreen && <>{GD.isPcScreen && <DesktopLayout />}</>}
							</>
						)}
					</>
				)}

				{/* Global AlertDialog, shows all types of messages */}
				<AlertDialog
					open={GD.globalWebAlertDialogProps.open}
					title={GD.globalWebAlertDialogProps.title}
					description={GD.globalWebAlertDialogProps.description}
					cancelText={GD.globalWebAlertDialogProps.cancelText}
					okText={GD.globalWebAlertDialogProps.okText}
					msgType={GD.globalWebAlertDialogProps.msgType}
					onReturn={(value: boolean) => {
						globalStore.setGlobalWebAlertDialogProps(tmplAlertDialogProps())
					}}
				/>

				{/* Global message line */}
				<MessageLine
					backgroundColor={GD.globalMessageLineProps.backgroundColor}
					color={GD.globalMessageLineProps.color}
					description={GD.globalMessageLineProps.description}
					open={GD.globalMessageLineProps.open}
					title={GD.globalMessageLineProps.title}
					timeout={GD.globalMessageLineProps.timeout}
				/>
			</div>
		</>
	)
}

export default observer(App)
