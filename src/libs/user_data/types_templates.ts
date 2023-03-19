import { EmptyPaneData } from '@/components/pane/types_template'

import { NotebookSourceAttrsArrKey, FileMetaValue, EntryFileSource, NotebookSource, ParsedEntryFileRes } from './types'

export const notebookAttrsArr = [
  'hashedSign',
  'title',
  'icon',
  'type',
  'content',
  'updateTime',
  'createTime',
  'tagsHashedSign'
] as NotebookSourceAttrsArrKey[]

export const fileMeta = {
  dtimeUtc: 0,
  mtimeUtc: 0,
  sha256: ''
} as FileMetaValue

export const manifestDataEmpty: ParsedEntryFileRes = {
  paneData: EmptyPaneData,
  fileMetaMapping: {},
  syncLockFileName: ''
}

export const entryFileTemplate: EntryFileSource = {
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

export const notebookTemplate: NotebookSource = {
  dataVersion: 1,
  attrsArr: notebookAttrsArr,
  dataArr: []
}
