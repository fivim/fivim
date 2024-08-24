import globalStore from '@/stores/globalStore'

// Convert absolute path to relative path
export const pathToRelPath = (p: string) => {
	const userFilesDir = globalStore.data.paths.userFiles
	return p.replace(userFilesDir, '')
}
