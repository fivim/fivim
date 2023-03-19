import { DocTypeNote } from '@/constants'
import { PaneData, Notebook, Note, Tag } from '@/components/pane/types'
import { tmplPaneData } from '@/components/pane/types_template'
import { DocTypeSheet } from '@/___professional___/constants'

import { EntryFileSource, NotebookSource, ParsedEntryFileRes, FileMeta } from './types'
import { tmplMmanifestData } from './types_templates'

export const parseEntryFile = (jsonStr: string): ParsedEntryFileRes => {
  const res: ParsedEntryFileRes = JSON.parse(JSON.stringify(tmplMmanifestData))

  try {
    const data: EntryFileSource = JSON.parse(jsonStr)
    if (data.dataVersion === 1) {
      res.paneData = parseNavColDataV1(data)
      res.fileMetaMapping = Object.fromEntries(Object.entries(data.fileMetaMapping).filter(([key]) => key !== '')) as FileMeta
      res.syncLockFileName = data.syncLockFileName
      return res
    }
  } catch (error) {
    console.log('>>> parseManifest error: ', error)
    return res
  }

  return res
}

export const parseNavColDataV1 = (data: EntryFileSource): PaneData => {
  const res = tmplPaneData
  const noteBooksData = data.noteBooks
  const nbAttrsArr = noteBooksData.attrsArr
  const nbDataArr = noteBooksData.dataArr

  const resNotebookArr: Notebook[] = []
  if (nbDataArr.length > 0) {
    for (const i of nbDataArr) {
      resNotebookArr.push({
        hashedSign: i[nbAttrsArr.indexOf('hashedSign')],
        icon: i[nbAttrsArr.indexOf('icon')],
        title: i[nbAttrsArr.indexOf('title')],
        mtimeUtc: parseInt(i[nbAttrsArr.indexOf('mtimeUtc')]),
        tagsArr: []
      })
    }
  }
  res.navigationCol.notebooks = resNotebookArr

  const tagsData = data.tags
  const tagAttrsArr = tagsData.attrsArr
  const tagDataArr = tagsData.dataArr
  const resTagsArr: Tag[] = []
  if (tagDataArr.length > 0) {
    for (const i of tagDataArr) {
      resTagsArr.push({
        hashedSign: i[tagAttrsArr.indexOf('hashedSign')],
        icon: i[tagAttrsArr.indexOf('icon')],
        title: i[tagAttrsArr.indexOf('title')],
        mtimeUtc: parseInt(i[nbAttrsArr.indexOf('mtimeUtc')])
      })
    }
  }
  res.navigationCol.tags = resTagsArr

  return res
}

export const parseNotebookJson = (jsonStr: string): Note[] => {
  const res: Note[] = []
  if (jsonStr === '') {
    return res
  }

  try {
    const data: NotebookSource = JSON.parse(jsonStr)
    return parseNotebookSourceV1(data)
  } catch (error) {
    console.log('>>> parseNotebook error: ', error)
    return res
  }
}

export const parseNotebookSourceV1 = (data: NotebookSource): Note[] => {
  const res: Note[] = []
  const attrsArr = data.attrsArr
  const dataArr = data.dataArr

  if (dataArr.length > 0) {
    for (const i of dataArr) {
      const tagsHashedSignArr: string[] = []
      const tagsArrTemp: string[] = i[attrsArr.indexOf('tagsHashedSign')].split(',')
      for (const i of tagsArrTemp) {
        if (i !== '') {
          tagsHashedSignArr.push(i)
        }
      }

      const itemType = i[attrsArr.indexOf('type')]
      if (itemType === DocTypeNote || itemType === DocTypeSheet) {
        res.push({
          content: i[attrsArr.indexOf('content')],
          createTime: new Date(i[attrsArr.indexOf('createTime')]),
          hashedSign: i[attrsArr.indexOf('hashedSign')],
          icon: i[attrsArr.indexOf('icon')],
          tagsArr: tagsHashedSignArr,
          title: i[attrsArr.indexOf('title')],
          type: itemType,
          updateTime: new Date(i[attrsArr.indexOf('updateTime')])
        })
      }
    }
  }

  return res
}
