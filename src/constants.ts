import { TimeHashedSignType } from '@/utils/hash'

export const TimeFormatYyyyMmDdHhMmSs = 'YYYY-MM-DD HH:mm:ss'

export const AvailableThemes = ['default', 'balance', 'frost', 'material', 'polar-night', 'pretty', 'sunrise']
export const ConfigFileName = 'conf.bin' // main configuration file
export const ConfigStartUpFileName = 'conf.startup.bin' // only read once on every startup
export const ConfigStartUpPwd = '' // pwd of ConfigStartUpFile
export const DefaultFileExt = ''
export const DefaultFileNameRule = TimeHashedSignType.formattedTimeSha256
export const DefaultListColSortBy = 'ctimeUtc'
export const DefaultListColSortOrder = 'ASC'
export const DefaultSyncIntervalSeconds = '300'// Use string
export const DefaultThemeDark = 'material'
export const DefaultThemeLight = 'default'
export const DefaultTimeFormat = TimeFormatYyyyMmDdHhMmSs
export const DocTypeNote = 'note'
export const ListColListTypeNotebook = 'notebook'
export const ListColListTypeTag = 'tag'
export const MasterPasswordMinLength = 8
export const MasterPasswordMaxLength = 32
export const MasterPasswordSalt = '___enas^#$___' // DO NOT MODIFY, OR THE OLD DATA WILL NOT BE DECRYPTED!
export const StrSignOk = 'OK'
export const StrSignErr = 'Err'
export const ReFileExt = /^(\.+[A-Za-z0-9]+)$/ // if not empty string
export const SyncLockTimeoutSeconds = 3600
