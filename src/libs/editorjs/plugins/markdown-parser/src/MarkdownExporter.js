import {
  Header2Md, Paragraph2Md, List2Md, Delimiter2Md, Image2Md,
  Checkbox2Md, Quote2Md, Code2Md, Link2Md, Table2Md
} from './blockParsers'
import { fileDownloadHandler } from './FileHandler'

/**
 * Markdown Parsing class
 */
export default class MarkdownExporter {
  /**
   * creates the Parser plugin
   * {editorData, api functions} - necessary to interact with the editor
   */
  constructor({ data, api }) {
    this.data = data
    this.api = api
  }

  /**
   * @return Plugin data such as title and icon
   */
  static get toolbox() {
    return {
      title: 'Download Markdown',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(112, 118, 132)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>'
    }
  }

  /**
   * @return empty div and run the export funtion
   */
  render() {
    const doc = document.createElement('div')

    this.getContent()
    return doc
  }

  /**
   * Function which takes saved editor data and runs the different parsing helper functions
   * @return Markdown file download
   */
  async getContent() {
    const today = new Date()
    const dd = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0') // January is 0!
    const yyyy = today.getFullYear()
    const data = await this.api.saver.save()

    // take parsed data and create a markdown file
    fileDownloadHandler(exporter(data.blocks), `entry_${dd}-${mm}-${yyyy}.md`)
  }

  save() {
    return {
      message: 'Downloading Markdown'
    }
  }
}

export const exporter = (blocks) => {
  // eslint-disable-next-line array-callback-return
  const parsedData = blocks.map((item) => {
    let tempArr = []
    // iterate through editor data and parse the single blocks to markdown syntax
    switch (item.type) {
      case 'header':
        return Header2Md(item.data)
      case 'paragraph':
        return Paragraph2Md(item.data)
      case 'list':
        tempArr = List2Md(item.data) || []
        return tempArr.join('\n')
      case 'delimiter':
        return Delimiter2Md(item)
      case 'image':
        return Image2Md(item.data)
      case 'quote':
        return Quote2Md(item.data)
      case 'checkbox':
        return Checkbox2Md(item.data)
      case 'code':
        return Code2Md(item.data)
      case 'checklist':
        return Checkbox2Md(item.data)
      //
      // case 'nestedList': // TODO not perfect
      //   tempArr = List2Md(item.data)
      //   return tempArr.join('\n')
      case 'link':
        return Link2Md(item.data)
      case 'table':
        return Table2Md(item.data)
      // case 'rawHtml': // TODO, data is {html: 'html'} ???
      //   return parseRawHtml2Md(item.data)
      default:
        break
    }
  })

  return parsedData.join('\n')
}
