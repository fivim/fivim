import { invoke as invokeTauri } from '@tauri-apps/api'
import { DialogFilter, open } from '@tauri-apps/api/dialog'

import { MessageType } from '@/types'

import { CommandsWeb } from './command_web'
import { InvokeArgs } from './types'

const CW = new CommandsWeb()

export class CommandsTauri {
	getName = () => 'tauri'
	invoke = async <T>(cmd: string, args?: InvokeArgs) => {
		const res = await invokeTauri(cmd, args)

		return res as T
	}

	showMessage = async (title: string, msg: string, msgType: MessageType, showConfirmBtn: boolean) => {
		return CW.showMessage(title, msg, msgType, showConfirmBtn)
	}

	reoladWindow = () => {
		CW.reoladWindow()
	}

	pickFile = async (allowedExtensions?: string[]) => {
		let filters: DialogFilter[] = []
		if (allowedExtensions && allowedExtensions?.length > 0) {
			filters = [
				{
					name: 'allowedExt',
					extensions: allowedExtensions || [],
				},
			]
		}
		const selected = await open({
			multiple: false,
			filters: filters,
		})
		if (Array.isArray(selected)) {
			return selected[0]
		} else if (selected === null) {
			return ''
		} else {
			return selected
		}
	}

	pickFiles = async (allowedExtensions?: string[]) => {
		let filters: DialogFilter[] = []
		if (allowedExtensions && allowedExtensions?.length > 0) {
			filters = [
				{
					name: 'allowedExt',
					extensions: allowedExtensions || [],
				},
			]
		}
		const selected = await open({
			multiple: true,
			filters: filters,
		})
		if (Array.isArray(selected)) {
			return selected
		} else if (selected === null) {
			return []
		} else {
			return [selected]
		}
	}
}
