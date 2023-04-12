import { TypeFile, TypeNote } from '@/constants'
import { tmplUserDataMap } from '@/types_template'

import {
  AttrsArrKeyOfFile, AttrsArrKeyOfNote, AttrsArrKeyOfNotebook, AttrsArrKeyOfFilesMeta,
  EntryFileSourceInfo, NotebookSourceInfo, EntryFileSourceInfoParsedRes,
  FileInfo, TagInfo, NoteInfo
} from './types'

export const tmplFilesMetaAttrsArr = (): AttrsArrKeyOfFilesMeta[] => {
  return [
    // common
    'ctimeUtc',
    'mtimeUtc',
    'sign',
    // other
    'dtimeUtc',
    'sha256',
    'size'
  ]
}

export const tmplFileAttrsArr = (): AttrsArrKeyOfFile[] => {
  return [
    // common
    'ctimeUtc',
    'mtimeUtc',
    'sign',
    'tagsSign',
    'title',
    // other
    'content',
    'originalSha256',
    'originalSize'
  ]
}

export const tmplNotebookAttrsArr = (): AttrsArrKeyOfNotebook[] => {
  return [
    // common
    'ctimeUtc',
    'mtimeUtc',
    'sign',
    'tagsSign',
    'title',
    // other
    'icon'
  ]
}

export const tmplNoteAttrsArr = (): AttrsArrKeyOfNote[] => {
  return [
    // common
    'ctimeUtc',
    'mtimeUtc',
    'sign',
    'tagsSign',
    'title',
    // other
    'content',
    'icon',
    'type'
  ]
}

export const tmplUserDataMetaAttrsArr = (): AttrsArrKeyOfFilesMeta[] => {
  return [
    // common
    'ctimeUtc',
    'mtimeUtc',
    'sign',
    // other
    'dtimeUtc',
    'size',
    'sha256'
  ]
}

export const tmplFileInfo = (): FileInfo => {
  return {
    ctimeUtc: new Date(), // create timestamp(in milliseconds)
    mtimeUtc: new Date(), // modify timestamp(in milliseconds)
    content: '', // remark content
    sign: '',
    originalSize: 0,
    originalSha256: '',
    title: '',
    tagsArr: [],
    type: TypeFile
  }
}

export const tmplNoteInfo = (): NoteInfo => {
  return {
    ctimeUtc: new Date(), // create timestamp(in milliseconds)
    mtimeUtc: new Date(), // modify timestamp(in milliseconds)
    sign: '',
    tagsArr: [],
    title: '',
    // other
    content: '',
    icon: '',
    type: TypeNote
  }
}

export const tmplTagInfo = (): TagInfo => {
  return {
    title: '',
    icon: '',
    sign: '',
    mtimeUtc: new Date(),
    ctimeUtc: new Date()
  }
}

export const tmplMmanifestData = (): EntryFileSourceInfoParsedRes => {
  return {
    userData: tmplUserDataMap(),
    lockFileName: ''
  }
}

export const tmplEntryFileData = (): EntryFileSourceInfo => {
  return {
    dataVersion: 1,
    noteBooks: {
      attrsArr: tmplNotebookAttrsArr(),
      dataArr: []
    },
    tags: {
      attrsArr: tmplNotebookAttrsArr(),
      dataArr: []
    },
    files: {
      attrsArr: tmplFileAttrsArr(),
      dataArr: []
    },
    filesMeta: {
      attrsArr: tmplFilesMetaAttrsArr(),
      dataArr: []
    },
    lockFileName: ''
  }
}

export const tmplNotebookData = (): NotebookSourceInfo => {
  return {
    dataVersion: 1,
    attrsArr: tmplNoteAttrsArr(),
    dataArr: []
  }
}
