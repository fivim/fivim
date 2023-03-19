import { PaneData } from './types'

export const tmplPaneData: PaneData = {
  navigationCol: {
    notebooks: [],
    tags: []
  },
  listCol: {
    hashedSign: '',
    icon: '',
    list: [],
    title: '',
    type: 'notebook',
    tagsArr: []
  },
  editorCol: {
    content: '',
    title: '',
    type: 'note'
  }
}
