import { PaneData } from './types'

export const EmptyPaneData: PaneData = {
  navigationColumn: {
    notebooks: [],
    tags: []
  },
  itemsColumn: {
    hashedSign: '',
    icon: '',
    list: [],
    title: '',
    type: 'notebook'
  },
  editorColumn: {
    content: '',
    title: '',
    type: 'note'
  }
}
