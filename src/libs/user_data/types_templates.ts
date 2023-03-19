import { tmplPaneData } from '@/components/pane/types_template'

import { NotebookSourceAttrsArrKey, FileMetaValue, EntryFileSource, NotebookSource, ParsedEntryFileRes } from './types'

export const tmplNotebookAttrsArr = [
  'hashedSign',
  'title',
  'icon',
  'type',
  'content',
  'updateTime',
  'createTime',
  'tagsHashedSign'
] as NotebookSourceAttrsArrKey[]

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
    attrsArr: [
      'title',
      'icon',
      'hashedSign',
      'mtimeUtc'
    ],
    dataArr: []
  },
  tags: {
    attrsArr: [
      'title',
      'icon',
      'hashedSign',
      'mtimeUtc'
    ],
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
  attrsArr: tmplNotebookAttrsArr,
  dataArr: []
}
