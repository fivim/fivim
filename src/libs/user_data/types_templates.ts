import { TypeFile } from '@/constants'

import { tmplUserDataMap } from '@/types_template'

import {
  AttrsArrKeyOfFile, AttrsArrKeyOfNote, AttrsArrKeyOfNotebook, AttrsArrKeyOfUserDataFileMeta,
  EntryFileSourceInfo, NotebookSourceInfo, EntryFileSourceInfoParsedRes,
  FileInfo, UserFileMetaInfo, TagInfo
} from './types'

export const tmplFileAttrsArr = [
  // common
  'ctimeUtc',
  'mtimeUtc',
  'sign',
  'tagsSign',
  'title',
  // other
  'content',
  'originalSize',
  'originalSha256'
] as AttrsArrKeyOfFile[]

export const tmplNotebookAttrsArr = [
  // common
  'ctimeUtc',
  'mtimeUtc',
  'sign',
  'tagsSign',
  'title',
  // other
  'icon'
] as AttrsArrKeyOfNotebook[]

export const tmplNoteAttrsArr = [
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
] as AttrsArrKeyOfNote[]

export const tmplUserDataMetaAttrsArr = [
  // common
  'ctimeUtc',
  'mtimeUtc',
  'sign',
  'title',
  // other
  'dtimeUtc',
  'size',
  'sha256'
] as AttrsArrKeyOfUserDataFileMeta[]

export const tmplFileInfo: FileInfo = {
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

export const tmplUserDataFilesMeta: UserFileMetaInfo = {
  ctimeUtc: new Date(), // create timestamp(in milliseconds)
  mtimeUtc: new Date(), // modify timestamp(in milliseconds)
  dtimeUtc: new Date(), // delete timestamp(in milliseconds)
  sign: '',
  sha256: '',
  size: 0
}

export const tmplTagInfo: TagInfo = {
  title: '',
  icon: '',
  sign: '',
  mtimeUtc: new Date(),
  ctimeUtc: new Date()
}

export const tmplMmanifestData: EntryFileSourceInfoParsedRes = {
  userDataMap: tmplUserDataMap,
  syncLockFileName: ''
}

export const tmplEntryFileData: EntryFileSourceInfo = {
  dataVersion: 1,
  noteBooks: {
    attrsArr: tmplNotebookAttrsArr,
    dataArr: []
  },
  tags: {
    attrsArr: tmplNotebookAttrsArr,
    dataArr: []
  },
  files: {
    attrsArr: tmplFileAttrsArr,
    dataArr: []
  },
  userDataFilesMeta: {
    attrsArr: [],
    dataArr: []
  },
  syncLockFileName: ''
}

export const tmplNotebook: NotebookSourceInfo = {
  dataVersion: 1,
  attrsArr: tmplNoteAttrsArr,
  dataArr: []
}
