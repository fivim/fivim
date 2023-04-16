export function Checkbox2Md(blockData) {
  let items = {}

  items = blockData.items.map((item) => {
    if (item.checked === true) {
      return `- [x] ${item.text}`
    }
    return `- [ ] ${item.text}`
  })

  return items.join('\n')
}

export function Code2Md(blockData) {
  return `\`\`\`\n${blockData.code}\n\`\`\`\n`
}

export function Md2Code(blockData) {
  const codeData = {
    data: {
      code: blockData.value
    },
    type: 'code'
  }

  return codeData
}

export function Delimiter2Md() {
  const delimiter = '---'

  return delimiter.concat('\n')
}

export function Md2Delimiter() {
  let delimiterData = {}

  delimiterData = {
    data: {
      items: []
    },
    type: 'delimiter'
  }

  return delimiterData
}

export function Header2Md(blockData) {
  switch (blockData.level) {
    case 1:
      return `# ${blockData.text}\n`
    case 2:
      return `## ${blockData.text}\n`
    case 3:
      return `### ${blockData.text}\n`
    case 4:
      return `#### ${blockData.text}\n`
    case 5:
      return `##### ${blockData.text}\n`
    case 6:
      return `###### ${blockData.text}\n`
    default:
      break
  }
}

export function Md2Header(blockData) {
  let headerData = {}

  switch (blockData.depth) {
    case 1:
      blockData.children.forEach((item) => {
        headerData = {
          data: {
            level: 1,
            text: item.value
          },
          type: 'header'
        }
      })

      return headerData
    case 2:
      blockData.children.forEach((item) => {
        headerData = {
          data: {
            level: 2,
            text: item.value
          },
          type: 'header'
        }
      })

      return headerData
    case 3:
      blockData.children.forEach((item) => {
        headerData = {
          data: {
            level: 3,
            text: item.value
          },
          type: 'header'
        }
      })

      return headerData
    case 4:
      blockData.children.forEach((item) => {
        headerData = {
          data: {
            level: 4,
            text: item.value
          },
          type: 'header'
        }
      })

      return headerData
    case 5:
      blockData.children.forEach((item) => {
        headerData = {
          data: {
            level: 5,
            text: item.value
          },
          type: 'header'
        }
      })

      return headerData
    case 6:
      blockData.children.forEach((item) => {
        headerData = {
          data: {
            level: 6,
            text: item.value
          },
          type: 'header'
        }
      })

      return headerData
    default:
      break
  }
}

export function Image2Md(blockData) {
  return `![${blockData.caption}](${blockData.file.url} "${blockData.caption}")`.concat('\n')
}

export function Link2Md(blockData) {
  return `[${blockData.meta.title}](${blockData.link})`
}

export function List2Md(blockData) {
  const arr = []
  switch (blockData.style) {
    case 'unordered':
      for (let index = 0; index < blockData.items.length; index++) {
        const item = blockData.items[index]
        arr.push(`* ${item}`)
      }

      arr.push('')
      return arr
    case 'ordered':
      for (let index = 0; index < blockData.items.length; index++) {
        const item = blockData.items[index]
        arr.push(`${index + 1}. ${item}`)
      }

      arr.push('')
      return arr
    default:
      break
  }

  return arr
}

export function Md2List(blockData) {
  let listData = {}
  const itemData = []

  blockData.children.forEach((items) => {
    items.children.forEach((listItem) => {
      listItem.children.forEach((listEntry) => {
        itemData.push(listEntry.value)
      })
    })
  })

  listData = {
    data: {
      items: itemData,
      style: blockData.ordered ? 'ordered' : 'unordered'
    },
    type: 'list'
  }

  return listData
}

export function Paragraph2Md(blockData) {
  return `${blockData.text}\n`
}

export function Md2Paragraph(blockData) {
  let paragraphData = {}

  if (blockData.type === 'paragraph') {
    blockData.children.forEach((item) => {
      if (item.type === 'text') {
        paragraphData = {
          data: {
            text: item.value
          },
          type: 'paragraph'
        }
      }

      if (item.type === 'image') {
        paragraphData = {
          data: {
            caption: item.title,
            stretched: false,
            url: item.url,
            withBackground: false,
            withBorder: false
          },
          type: 'image'
        }
      }

      if (item.type === 'link') {
        console.log(item.children)

        paragraphData = {
          data: {
            link: item.url,
            meta: {
              title: item.children.length > 0 ? item.children[0].value : '',
              site_name: '',
              description: '',
              image: {
                url: ''
              }
            }
          },
          type: 'link'
        }
      }
    })
  }
  return paragraphData
}

export function Quote2Md(blockData) {
  return `> ${blockData.text}\n`
}

export function Md2Quote(blockData) {
  let quoteData = {}

  blockData.children
    .forEach((items) => {
      items.children.forEach((listItem) => {
        if (listItem.type === 'text') {
          quoteData = {
            data: {
              alignment: 'left',
              caption: '',
              text: listItem.value
            },
            type: 'quote'
          }
        }
      })
    })

  return quoteData
}

export function Table2Md(blockData) {
  const res = []
  for (let index = 0; index < blockData.content.length; index++) {
    const item = blockData.content[index]

    res.push(`| ${item.join(' | ')} |`)
    if (index === 0) {
      const ddd = []
      item.forEach(() => { ddd.push('---') })
      res.push(`| ${ddd.join(' | ')} |`)
    }
  }

  return res.join('\n')
}

export function Md2Table(blockData) {
  const tableData = {
    type: 'table',
    data: {
      content: []
    }
  }

  blockData.children.forEach((itemRow) => {
    const rowData = []

    itemRow.children.forEach((itemCell) => {
      itemCell.children.forEach((itemCellValue) => {
        rowData.push(itemCellValue.value)
      })
    })

    tableData.data.content.push(rowData)
  })

  return tableData
}
