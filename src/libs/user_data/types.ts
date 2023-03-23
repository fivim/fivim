import { PaneData } from '@/components/pane/types'

export type FileMetaValue = {
    mtimeUtc: number // modify timestamp
    dtimeUtc: number// delete timestamp
    sha256: string
}
export type FileMeta = { [key: string]: FileMetaValue }

// User's entry file data
export type NotebookAttrsArrKey = 'title' | 'icon' | 'hashedSign' | 'mtimeUtc' | 'tagsHashedSign'
export type EntryFileSource = {
    dataVersion: number
    noteBooks: {
        attrsArr: NotebookAttrsArrKey[]
        dataArr: string[][]
    },
    tags: {
        attrsArr: NotebookAttrsArrKey[]
        dataArr: string[][]
    },
    attachments: {
        attrsArr: NotebookAttrsArrKey[]
        dataArr: string[][]
    },
    // files: {
    //     attrsArr: EntryFileSourceNotebooksTagsAttrsArrKey[]
    //     dataArr: string[][]
    // },
    fileMetaMapping: FileMeta
    syncLockFileName: string
}

// User's note data
export type NoteAttrsArrKey = 'title' | 'icon' | 'hashedSign' | 'type' | 'content' | 'mtimeUtc' | 'ctimeUtc' | 'tagsHashedSign'
export type NotebookSource = {
    dataVersion: number
    attrsArr: NoteAttrsArrKey[]
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
