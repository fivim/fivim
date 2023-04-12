import { TypeFile, TypeMarkdown, TypeNone, TypeNote, TypeTag, TaskUpdateFilesSha256 } from '@/constants'

export type TypeDocInfo = typeof TypeMarkdown | typeof TypeNote | typeof TypeNone
export type TypeFileInfo = typeof TypeFile
export type TypeTagListItemInfo = typeof TypeTag | typeof TypeFile | typeof TypeMarkdown | typeof TypeNote
export type TaskLock = typeof TaskUpdateFilesSha256

export type FileInfo = {
    // common
    ctimeUtc: Date // create timestamp(in milliseconds)
    mtimeUtc: Date // modify timestamp(in milliseconds)
    sign: string
    tagsArr: string[]
    title: string
    // other
    content: string // remark content
    originalSize: number, // Original size
    originalSha256: string, // Original sha256
    type: TypeFileInfo
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
    type: TypeDocInfo
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

// Meta info of every user's encrypted file.
export type UserFileMetaInfo = {
    // common
    ctimeUtc: Date // create timestamp(in milliseconds)
    mtimeUtc: Date // modify timestamp(in milliseconds)
    dtimeUtc: Date // delete timestamp(in milliseconds)
    sign: string
    // other
    sha256: string
    size: number
}

export type UserDataInfo = {
    files: FileInfo[]
    notebooks: NotebookInfo[]
    tags: TagInfo[]
    filesMeta: UserFileMetaInfo[]
}

// export type AttrsArrKeyOfFile = keyof FileInfo
// export type AttrsArrKeyOfNotebook = keyof NotebookInfo
// export type AttrsArrKeyOfNote = keyof NoteInfo
// export type AttrsArrKeyOfUserDataFileMeta = keyof UserDataFileMetaInfo

// warning:
// tagsSign used to record the items in tagsArr as "tag1,tag2"
export type AttrsArrKeyOfFile = 'ctimeUtc' | 'mtimeUtc' | 'sign' | 'tagsSign' | 'title' | 'content' | 'sha256' | 'originalSize' | 'originalSha256'
export type AttrsArrKeyOfNotebook = 'ctimeUtc' | 'mtimeUtc' | 'sign' | 'tagsSign' | 'title' | 'icon'
export type AttrsArrKeyOfNote = 'ctimeUtc' | 'mtimeUtc' | 'sign' | 'tagsSign' | 'title' | 'content' | 'icon' | 'type'
export type AttrsArrKeyOfFilesMeta = 'ctimeUtc' | 'mtimeUtc' | 'dtimeUtc' | 'sign' | 'sha256' | 'size'

// User's entry file data
export type EntryFileSourceInfo = {
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
    filesMeta: {
        attrsArr: AttrsArrKeyOfFilesMeta[]
        dataArr: string[][]
    },
    lockFileName: string
}

export type EntryFileSourceInfoParsedRes = {
    userData: UserDataInfo
    lockFileName: string,
}

// User's note data
export type NotebookSourceInfo = {
    dataVersion: number
    attrsArr: AttrsArrKeyOfNote[]
    dataArr: string[][]
}

// User's lock file data
export type LockSourceInfo = {
    nextTask: {
        name: TaskLock
    },
    sync: {
        syncStartTimestamp: number
        syncExpireTimestamp: number
    }
}

export type MergeEntryFileMetaInfo = {
    lockFileName: string
}

// For tag list, it will contain various types of data.
export type TagListItemInfo = {
    sign: string
    tagsArr: string[]
    title: string
    type: TypeTagListItemInfo
    icon: string
    parentSign: string // for notebook file
}
