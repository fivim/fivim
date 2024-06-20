import i18n from '@/i18n'
import { InvokeArgs, InvokeOptions } from '@/invoker/types'
import globalStore from '@/stores/globalStore'
import { MessageType } from '@/types'
import { tmplAlertDialogProps } from '@/types_template'

const t = i18n.t

export class CommandsWeb {
	getName = () => 'web'

	invoke<T>(_cmd: string, _args?: InvokeArgs, _options?: InvokeOptions): Promise<T> {
		return Promise.resolve(null as T)
	}

	showMessage = async (title: string, msg: string, msgType: MessageType, showConfirmBtn: boolean) => {
		const options = {
			open: true,
			title: title,
			description: msg,
			cancelText: showConfirmBtn ? t('Cancel') : '',
			okText: t('OK'),
			msgType: msgType,
		}

		if (intervalId) clearInterval(intervalId) // Clear interval if exist
		globalStore.setGlobalWebAlertDialogRes(null) // TODO: Resetting before calling setGlobalWebAlertDialogProps to be effective

		if (msgType === 'confirm') {
			globalStore.setGlobalWebAlertDialogProps(options)
			return await checkGlobalWebAlertDialogRes()
		}

		if (msgType === 'error') {
			globalStore.setGlobalWebAlertDialogProps(options)
			return true
		}

		globalStore.setGlobalMessageLineProps({
			backgroundColor: 'var(--fvm-border-clr)',
			color: 'var(--fvm-text-clr)',
			description: msg,
			open: true,
			title: title,
			timeout: msgType === 'warning' ? 10000 : 2000,
		})
		return true
	}

	reoladWindow = () => {
		location.reload()
	}

	pickFile = async (allowedExtensions?: string[]) => {
		return ''
	}
	pickFiles = async (allowedExtensions?: string[]) => {
		return []
	}
}

let intervalId: NodeJS.Timeout | null = null

function checkGlobalWebAlertDialogRes(): Promise<boolean> {
	return new Promise((resolve, reject) => {
		intervalId = setInterval(() => {
			const res = globalStore.getData().globalWebAlertDialogRes

			if (res !== null) {
				// Reset
				globalStore.setGlobalWebAlertDialogProps(tmplAlertDialogProps())
				// TODO: Resetting here is invalid, it needs to be done before calling setGlobalWebAlertDialogProps to be effective
				// runningStore.setGlobalWebAlertDialogRes(null)

				if (intervalId) clearInterval(intervalId)

				resolve(res)
			}
		}, 100)
	})
}
