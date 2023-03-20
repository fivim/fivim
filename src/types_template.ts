import { AppInfo, AppMode, Setting } from '@/types'
import { DocTypeNote } from '@/constants'

import { EntryFileSource } from '@/libs/user_data/types'

export const tmplAppData: AppInfo = {
  appMode: AppMode.Empty,
  appName: '',
  changeLocaleTimestamp: 0,
  changeMasterPasswordStatus: {
    action: '',
    percent: 0,

    currentNumber: 0,
    totalNumber: 0
  },
  currentFile: {
    hashedSign: '',
    indexInList: 0,
    name: '',
    type: DocTypeNote
  },
  currentTheme: '',
  dataPath: {
    pathOfHome: '',
    pathOfConfig: '',
    pathOfHomeAppData: '',
    pathOfCurrentDir: '',
    pathOfCustomStyle: '',
    pathOfCustomBackgroundImage: '',
    pathOfSyncDir: '',
    pathOfSyncCachedDir: '',
    pathOfSyncDownloadDir: ''
  },
  defaultLocale: '',
  defaultLocaleInNative: '',
  editorFullScreen: false,
  existConfigFile: false,
  fileMetaMapping: {},
  isWebPage: true,
  lockscreen: true,
  textDirection: 'LTR',
  version: ''
}

export const tmplSettingData: Setting = {
  normal: {
    language: '',
    showFileSavingStatus: true,
    spellCheck: false,
    workDir: ''
  },
  appearance: {
    dateTimeFormat: '',
    theme: '',
    customBackagroundImg: '',
    customBackagroundOpacity: 0.8,
    listColSortBy: 'title',
    listColSortOrder: 'ASC',
    listColShowCreateTime: true,
    listColShowUpdateTime: true
  },
  encryption: {
    masterPassword: '',
    enableFileCompress: true,
    entryFileName: '',
    fileExt: '',
    fileNameRule: 'formattedTimeSha256',
    syncLockFileName: ''
  }
}

export const tmplEntryFileData: EntryFileSource = {
  dataVersion: 0,
  noteBooks: {
    attrsArr: [],
    dataArr: []
  },
  tags: {
    attrsArr: [],
    dataArr: []
  },
  attachments: {
    attrsArr: [],
    dataArr: []
  },
  fileMetaMapping: {},
  syncLockFileName: ''
}
