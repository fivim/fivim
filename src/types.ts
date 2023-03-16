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

export type CurrentFile = {
    hashedSign: string // hashed file name of currently opened
    indexInItemsList: number
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
    pathOfAppData: string;
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
    changeLocaleTimestamp: number // record timestamp for editor i18n
    changeMasterPasswordStatus: ChangeMasterPasswordStatus
    currentFile: CurrentFile
    currentTheme: string
    dataPath: DataPath
    editorFullScreen: boolean
    existConfigFile: boolean
    fileMetaMapping: FileMeta
    isWebPage: boolean
    lockscreen: boolean
    pathSeparator: string
    textDirection: TextDirection
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
        itemsColumnShowCreateTime: boolean
        itemsColumnShowUpdateTime: boolean
        itemsColumnSortBy: 'title' | 'updateTime' | 'createTime'
        itemsColumnSortOrder: 'ASC' | 'DESC'
        theme: string
    },
    sync: {
        storageType: string
        enableFailSafe: boolean
        intervalSeconds: string // For ElSelect
        lastSyncTimestamp: number

        amazonS3: {
            bucket: string
            url: string
            region: string
            accessKey: string
            secretKey: string
        },
        aliyunOss: {
            bucket: string
            url: string
            region: string
            accessKeyId: string
            accessKeySecret: string
        },
        localDisk: {
            remoteDirPath: string
        }
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
