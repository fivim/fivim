import { PaneData } from '@/components/pane/types'

export type FileMetaValue = {
    mtimeUtc: number // modify timestamp
    dtimeUtc: number// delete timestamp
    sha256: string
}
export type FileMeta = { [key: string]: FileMetaValue }

// User's entry file data
export type EntryFileSourceNotebooksTagsAttrsArrKey = 'title' | 'icon' | 'hashedSign' | 'mtimeUtc'
export type EntryFileSource = {
    dataVersion: number
    noteBooks: {
        attrsArr: EntryFileSourceNotebooksTagsAttrsArrKey[]
        dataArr: string[][]
    },
    tags: {
        attrsArr: EntryFileSourceNotebooksTagsAttrsArrKey[]
        dataArr: string[][]
    },
    attachments: {
        attrsArr: EntryFileSourceNotebooksTagsAttrsArrKey[]
        dataArr: string[][]
    },
    // files: {
    //     attrsArr: EntryFileSourceNotebooksTagsAttrsArrKey[]
    //     dataArr: string[][]
    // },
    fileMetaMapping: FileMeta
    syncLockFileName: string
}

// User's notebook data
export type NotebookSourceAttrsArrKey = 'title' | 'icon' | 'hashedSign' | 'summary' | 'type' | 'content' | 'updateTime' | 'createTime' | 'tagsHashedSign'
export type NotebookSource = {
    dataVersion: number
    attrsArr: NotebookSourceAttrsArrKey[]
    dataArr: string[][]
}

// User's sync lock data
export type SyncLockSource = {
    syncStartTimestamp: number
    syncExpireTimestamp: number
}

export type ParsedEntryFileRes = {
    paneData: PaneData
    fileMetaMapping: FileMeta
    syncLockFileName: string,
}

export type MergeEntryFileMeta = {
    fileMetaMapping: FileMeta
    syncLockFileName: string
}
