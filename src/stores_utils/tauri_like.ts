import { join as pathJoinT } from '@tauri-apps/api/path'

import globalStore from '@/stores/globalStore'

import { removeEnding } from '../utils/string'

export const pathJoin = (...paths: string[]) => {
	if (globalStore.data.runInTauri) {
		return pathJoinT(...paths)
	} else {
		const arr = []
		for (let index = 0; index < paths.length; index++) {
			const item = paths[index]
			arr.push(removeEnding(item, globalStore.data.paths.separator))
		}
		return Promise.resolve(arr.join(globalStore.data.paths.separator))
	}
}
