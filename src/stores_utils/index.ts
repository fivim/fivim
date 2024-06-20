import { EXT_RICH_TEXT } from '@/constants'
import globalStore from '@/stores/globalStore'
import settingStore from '@/stores/settingStore'

export const showOutline = () => {
	const GD = globalStore.getData()
	const SD = settingStore.getData()

	const encryptedFileExt = SD.encryptedFileExt
	if (
		GD.currentFileName.endsWith(`.${EXT_RICH_TEXT[0]}`) ||
		GD.currentFileName.endsWith(`.${EXT_RICH_TEXT[0]}.${encryptedFileExt}`)
	) {
		return true
	}

	return false
}

export const cacheXrtm = (filePath: string) => {
	// TODO:
}

export const cacheXrtmDir = (dirPath: string) => {
	// TODO:
}
