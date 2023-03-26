import { DocType, FileType } from '@/libs/user_data/types'
import { TimeHashedSignType } from '@/utils/hash'

export type TextDirection = 'LTR' | 'RTL'

export enum AppMode {
    App = 'app',
    Web = 'web',
    Desktop = 'desktop',
    Empty = '',
    Mobile = 'mobile'
}

export type AppCoreConf = {
    appName: string
    defaultLanguage: string,
    defaultLanguageInNative: string,
    homeAppDir: string
    homeDir: string
    version: string
}

export type CurrentFile = {
    sign: string // hashed file name of currently opened
    indexInList: number // the index in list of the list column
    name: string // file name of currently opened
    type: DocType | FileType
}

export type ChangeMasterPasswordStatus = {
    action: string
    percent: number

    currentNumber: number
    totalNumber: number
}

export type ChangeMasterPasswordProcessItem = {
    percent: number
    color: string
}

export type DataPath = {
    separator: string,
    pathOfHomeAppData: string;
    pathOfHome: string;
}

export type ExtDataPath = {
    pathOfHome: string,
    pathOfHomeAppData: string,
    pathOfConfig: string,
    pathOfConfigStartUp: string,
    pathOfCurrentDir: string,
    pathOfSyncDir: string,
    pathOfSyncCachedDir: string,
    pathOfSyncDownloadDir: string,
    // style
    pathOfCustomStyle: string,
    pathOfCustomBackgroundImage: string
}

export type AppInfo = {
    appMode: AppMode // desktop mode or mobile mode
    appName: string
    changeLocaleTimestamp: number // record timestamp for editor i18n
    changeMasterPasswordStatus: ChangeMasterPasswordStatus
    currentFile: CurrentFile
    currentTheme: string
    dataPath: DataPath
    defaultLocale: string,
    defaultLocaleInNative: string,
    editorFullScreen: boolean
    existConfigFile: boolean
    isWebPage: boolean
    lockscreen: boolean
    textDirection: TextDirection
    version: string
}

export type Setting = {
    normal: {
        showFileSavingStatus: boolean
        spellCheck: boolean
        workDir: string
    },
    appearance: {
        dateTimeFormat: string
        locale: string
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
        syncLockFileName: string
    }
}

export type SettingOfStartUp = {
    appearance: {
        locale: string
        theme: string
    },
}

export enum ErrorMessages {
    FileVerificationFailed = 'File verification failed' // TODO add translate
}
