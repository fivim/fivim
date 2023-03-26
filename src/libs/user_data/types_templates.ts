import { TypeFile } from '@/constants'
import { tmplPaneData } from '@/components/pane/types_template'

import {
  AttrsArrKeyOfFile, AttrsArrKeyOfNote, AttrsArrKeyOfNotebook,
  EntryFileSource, NotebookSource, EntryFileSourceParsedRes, FileInfo, TagInfo
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
  'dtimeUtc',
  'sha256'
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

export const tmplFileInfo: FileInfo = {
  ctimeUtc: new Date(), // create timestamp(in milliseconds)
  mtimeUtc: new Date(), // modify timestamp(in milliseconds)
  dtimeUtc: new Date(), // delete timestamp(in milliseconds)
  content: '', // remark content
  sha256: '',
  sign: '',
  size: 0,
  title: '',
  tagsArr: [],
  type: TypeFile
}

export const tmplTagInfo: TagInfo = {
  title: '',
  icon: '',
  sign: '',
  mtimeUtc: new Date(),
  ctimeUtc: new Date()
}

export const tmplMmanifestData: EntryFileSourceParsedRes = {
  paneData: tmplPaneData,
  syncLockFileName: ''
}

export const tmplEntryFileData: EntryFileSource = {
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
  syncLockFileName: ''
}

export const tmplNotebook: NotebookSource = {
  dataVersion: 1,
  attrsArr: tmplNoteAttrsArr,
  dataArr: []
}
