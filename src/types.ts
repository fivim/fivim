import { DocType } from '@/components/pane/types'
import { FileMeta } from '@/libs/user_data/types'
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
    hashedSign: string // hashed file name of currently opened
    indexInList: number // the index in list of the list column
    name: string // file name of currently opened
    type: DocType
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
    // core
    pathOfHomeAppData: string;
    pathOfConfig: string;
    pathOfHome: string;
    pathOfCurrentDir: string
    // other
    pathOfCustomStyle: string
    pathOfCustomBackgroundImage: string
    pathOfSyncDir: string
    pathOfSyncCachedDir: string
    pathOfSyncDownloadDir: string
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
    fileMetaMapping: FileMeta
    isWebPage: boolean
    lockscreen: boolean
    textDirection: TextDirection
    version: string
}

export type Setting = {
    normal: {
        language: string
        showFileSavingStatus: boolean
        spellCheck: boolean
        workDir: string
    },
    appearance: {
        customBackagroundImg: string
        customBackagroundOpacity: number
        dateTimeFormat: string
        listColShowCreateTime: boolean
        listColShowUpdateTime: boolean
        listColSortBy: 'title' | 'updateTime' | 'createTime'
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
