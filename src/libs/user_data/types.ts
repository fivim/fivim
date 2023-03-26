import { TypeFile, TypeNone, TypeNote } from '@/constants'

import { PaneData } from '@/components/pane/types'

export type DocType = typeof TypeNote | typeof TypeNone
export type FileType = typeof TypeFile

export type FileInfo = {
    // common
    ctimeUtc: Date // create timestamp(in milliseconds)
    mtimeUtc: Date // modify timestamp(in milliseconds)
    sign: string
    tagsArr: string[]
    title: string
    // other
    content: string // remark content
    dtimeUtc: Date // delete timestamp(in milliseconds)
    sha256: string
    size: number,
    type: FileType
}

export type NotebookInfo = {
    // common
    ctimeUtc: Date // create timestamp(in milliseconds)
    mtimeUtc: Date // modify timestamp(in milliseconds)
    sign: string
    tagsArr: string[]
    title: string
    // other
    icon: string
}

export type NoteInfo = {
    // common
    ctimeUtc: Date // create timestamp(in milliseconds)
    mtimeUtc: Date // modify timestamp(in milliseconds)
    sign: string
    tagsArr: string[]
    title: string
    // other
    content: string
    icon: string
    type: DocType
}

export type TagInfo = {
    // common
    ctimeUtc: Date // create timestamp(in milliseconds)
    mtimeUtc: Date // modify timestamp(in milliseconds)
    sign: string
    title: string
    // other
    icon: string
}

export type AttrsArrKeyOfFile = 'ctimeUtc' | 'mtimeUtc' | 'sign' | 'tagsSign' | 'title' | 'content' | 'dtimeUtc' | 'sha256' | 'size'
export type AttrsArrKeyOfNotebook = 'ctimeUtc' | 'mtimeUtc' | 'sign' | 'tagsSign' | 'title' | 'icon'
export type AttrsArrKeyOfNote = 'ctimeUtc' | 'mtimeUtc' | 'sign' | 'tagsSign' | 'title' | 'content' | 'icon' | 'type'

// User's entry file data
export type EntryFileSource = {
    dataVersion: number
    noteBooks: {
        attrsArr: AttrsArrKeyOfNotebook[]
        dataArr: string[][]
    },
    tags: {
        attrsArr: AttrsArrKeyOfNotebook[]
        dataArr: string[][]
    },
    files: {
        attrsArr: AttrsArrKeyOfFile[]
        dataArr: string[][]
    },
    syncLockFileName: string
}

export type EntryFileSourceParsedRes = {
    paneData: PaneData
    syncLockFileName: string,
}

// User's note data
export type NotebookSource = {
    dataVersion: number
    attrsArr: AttrsArrKeyOfNote[]
    dataArr: string[][]
}

// User's sync lock data
export type SyncLockSource = {
    syncStartTimestamp: number
    syncExpireTimestamp: number
}

export type MergeEntryFileMeta = {
    syncLockFileName: string
}

export { TypeNote }
