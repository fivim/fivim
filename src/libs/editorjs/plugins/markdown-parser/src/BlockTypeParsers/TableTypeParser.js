export function parseTableToMarkdown(blockData) {
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

export function parseMarkdownToTable(blockData) {
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
