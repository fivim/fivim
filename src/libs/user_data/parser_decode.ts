import { DocTypeNote } from '@/constants'
import { PaneData, Notebook, Note, Tag } from '@/components/pane/types'
import { tmplPaneData } from '@/components/pane/types_template'
import { CmdInvoke } from '@/libs/commands'
import { jsonCopy } from '@/utils/utils'

import { EntryFileSource, NotebookSource, ParsedEntryFileRes, FileMeta } from './types'
import { tmplMmanifestData } from './types_templates'

export const parseEntryFile = (jsonStr: string): ParsedEntryFileRes => {
  const res: ParsedEntryFileRes = jsonCopy(tmplMmanifestData)

  try {
    const data: EntryFileSource = JSON.parse(jsonStr)
    if (data.dataVersion === 1) {
      res.paneData = parseNavColDataV1(data)
      res.fileMetaMapping = Object.fromEntries(Object.entries(data.fileMetaMapping).filter(([key]) => key !== '')) as FileMeta
      res.syncLockFileName = data.syncLockFileName
      return res
    }
  } catch (error) {
    CmdInvoke.logError('>>> parseManifest error: ' + error)
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
      const item = {
        hashedSign: i[nbAttrsArr.indexOf('hashedSign')],
        icon: i[nbAttrsArr.indexOf('icon')],
        title: i[nbAttrsArr.indexOf('title')],
        mtimeUtc: parseInt(i[nbAttrsArr.indexOf('mtimeUtc')]),
        tagsArr: getTagsArr(i[nbAttrsArr.indexOf('tagsHashedSign')])
      }
      resNotebookArr.push(item)
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
    CmdInvoke.logError('>>> parseNotebook error: ' + error)
    return res
  }
}

export const parseNotebookSourceV1 = (data: NotebookSource): Note[] => {
  const res: Note[] = []
  const attrsArr = data.attrsArr
  const dataArr = data.dataArr

  if (dataArr.length > 0) {
    for (const i of dataArr) {
      const itemType = i[attrsArr.indexOf('type')]
      if (itemType === DocTypeNote) {
        res.push({
          content: i[attrsArr.indexOf('content')],
          ctimeUtc: new Date(i[attrsArr.indexOf('ctimeUtc')]),
          hashedSign: i[attrsArr.indexOf('hashedSign')],
          icon: i[attrsArr.indexOf('icon')],
          tagsArr: getTagsArr(i[attrsArr.indexOf('tagsHashedSign')]),
          title: i[attrsArr.indexOf('title')],
          type: itemType,
          mtimeUtc: new Date(i[attrsArr.indexOf('mtimeUtc')])
        })
      }
    }
  }

  return res
}

const getTagsArr = (tagsHashedSign: string) => {
  const tagsHashedSignArr: string[] = []
  const tagsArrTemp: string[] = tagsHashedSign.split(',')
  for (const i of tagsArrTemp) {
    if (i !== '') {
      tagsHashedSignArr.push(i)
    }
  }
  return tagsHashedSignArr
}
