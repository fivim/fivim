import { useSettingStore } from '@/pinia/modules/settings'
import { usePaneDataStore } from '@/pinia/modules/pane_data'

export const getEntryFileName = () => {
  const settingStore = useSettingStore()
  return settingStore.data.encryption.entryFileName
}

export const genCurrentNotebookFileName = () => {
  const settingStore = useSettingStore()
  const paneDataStore = usePaneDataStore()
  const hashedSign = paneDataStore.data.itemsColumn.hashedSign
  const senc = settingStore.data.encryption
  return `${hashedSign}${senc.fileExt}`
}
