import settingStore from '@/stores/settingStore'

// Convert absolute path to relative path
export const pathToRelPath = (p: string) => {
	const userFilesDir = settingStore.getUserFilesDir()
	return p.replace(userFilesDir, '')
}
