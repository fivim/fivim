export function parseListToMarkdown(blockData) {
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

export function parseMarkdownToList(blockData) {
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
