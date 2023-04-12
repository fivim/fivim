
import { TypeNone, TaskEncrypt, TaskDecrypt, TaskReEncrypt, TaskChangeMasterPassword, TaskUpdateFilesSha256 } from '@/constants'
import { UserDataInfo } from '@/libs/user_data/types'
import { CurrentFileInfo, ListColInfo, NavColInfo } from '@/components/pane/types'
import { TimeHashedSignType } from '@/utils/hash'

export type TextDirectionInfo = 'LTR' | 'RTL'
export type TypeTask = typeof TypeNone | typeof TaskEncrypt | typeof TaskDecrypt | typeof TaskReEncrypt |
    typeof TaskChangeMasterPassword | typeof TaskUpdateFilesSha256

export enum AppModeInfo {
    App = 'app',
    Web = 'web',
    Desktop = 'desktop',
    Empty = '',
    Mobile = 'mobile'
}

export type AppCoreConfInfo = {
    appName: string
    defaultLanguage: string,
    defaultLanguageInNative: string,
    homeAppDir: string
    homeDir: string
    logFilePath: string
    repo: string
    version: string
}

export type ProgressColorInfo = {
    percent: number
    color: string
}

export type ProgressCommonInfo = {
    percent: number
    taskName: TypeTask
    isFailure: boolean
    isSuccess: boolean
    message: string
}

export type ProgressChangeMasterPasswordInfo = {
    totalFilesCount: number
    currentFileIndex: number
    currentFileName: string
    currentFileSize: number
}

export type ProgressInfo = {
    currentTask: ProgressCommonInfo
    changeMasterPassword: ProgressChangeMasterPasswordInfo
}

export type DataPathInfo = {
    separator: string
    pathOfHomeAppData: string
    pathOfHome: string
    pathOfLogFile: string
}

export type ExtDataPathInfo = {
    pathOfHome: string
    pathOfHomeAppData: string
    pathOfConfig: string
    pathOfConfigStartUp: string
    pathOfChangeMasterPasswordDir: string
    pathOfCurrentDir: string
    pathOfSyncDir: string
    pathOfSyncCachedDir: string
    pathOfSyncDownloadDir: string
    // style
    pathOfCustomStyle: string
    pathOfCustomBackgroundImage: string
}

export type SettingInfo = {
    normal: {
        showFileSavingStatus: boolean
        spellCheck: boolean
        workDir: string
        locale: string
    },
    appearance: {
        customBackagroundImg: string
        customBackagroundOpacity: number
        dateTimeFormat: string
        listColShowCreateTime: boolean
        listColShowUpdateTime: boolean
        listColSortBy: 'title' | 'mtimeUtc' | 'ctimeUtc'
        listColSortOrder: 'ASC' | 'DESC'
        theme: string
    },
    encryption: {
        masterPassword: string
        enableFileCompress: boolean
        entryFileName: string
        fileExt: string
        fileNameRule: keyof typeof TimeHashedSignType
        lockFileName: string
    },
    startupTask: ProgressCommonInfo
}

export type SettingOfStartUpInfo = {
    normal: {
        locale: string
    },
    appearance: {
        theme: string
    },
}

export type AppInfo = {
    appMode: AppModeInfo // desktop mode or mobile mode
    appName: string
    appRepo: string
    changeLocaleTimestamp: number // record timestamp for editor i18n
    currentFile: CurrentFileInfo
    currentTheme: string
    dataPath: DataPathInfo
    defaultLocale: string
    defaultLocaleInNative: string
    editorFullScreen: boolean
    existConfigFile: boolean
    isWebPage: boolean
    listCol: ListColInfo
    navCol: NavColInfo
    lockscreen: boolean
    progress: ProgressInfo
    settings: SettingInfo
    textDirection: TextDirectionInfo
    userData: UserDataInfo
    version: string
}

export enum MessagesInfo {
    FileVerificationFailed = 'File verification failed',
    FileStillInProgress = '&have task in progress'
}
