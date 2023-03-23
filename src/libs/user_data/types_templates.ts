import { tmplPaneData } from '@/components/pane/types_template'

import { NoteAttrsArrKey, NotebookAttrsArrKey, FileMetaValue, EntryFileSource, NotebookSource, ParsedEntryFileRes } from './types'

export const tmplNotebookAttrsArr = [
  'title',
  'icon',
  'hashedSign',
  'mtimeUtc',
  'tagsHashedSign'
] as NotebookAttrsArrKey[]

export const tmplNoteAttrsArr = [
  'hashedSign',
  'title',
  'icon',
  'type',
  'content',
  'mtimeUtc',
  'ctimeUtc',
  'tagsHashedSign'
] as NoteAttrsArrKey[]

export const tmplFileMeta = {
  dtimeUtc: 0,
  mtimeUtc: 0,
  sha256: ''
} as FileMetaValue

export const tmplMmanifestData: ParsedEntryFileRes = {
  paneData: tmplPaneData,
  fileMetaMapping: {},
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
  attachments: {
    attrsArr: [],
    dataArr: []
  },
  // files: {
  //   attrsArr: [],
  //   dataArr: []
  // },
  fileMetaMapping: {},
  syncLockFileName: ''
}

export const tmplNotebook: NotebookSource = {
  dataVersion: 1,
  attrsArr: tmplNoteAttrsArr,
  dataArr: []
}
