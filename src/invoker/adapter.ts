import globalStore from '@/stores/globalStore'

import { CommandsTauri } from './command_tauri'
import { CommandsWeb } from './command_web'
import { Commands } from './types'

const CT = new CommandsTauri()
const CW = new CommandsWeb()

export const cmdAdapter = (): Commands => {
	if (globalStore.getData().runInTauri) {
		return CT
	}
	return CW
}
