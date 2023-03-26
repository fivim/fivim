import { TypeNote } from '@/constants'

import { PaneData } from './types'

export const tmplPaneData: PaneData = {
  navigationCol: {
    files: [],
    notebooks: [],
    tags: []
  },
  listCol: {
    sign: '',
    icon: '',
    list: [],
    title: '',
    type: TypeNote,
    tagsArr: []
  },
  editorCol: {
    content: '',
    sign: '',
    title: '',
    type: TypeNote,
    tagsArr: []
  }
}
