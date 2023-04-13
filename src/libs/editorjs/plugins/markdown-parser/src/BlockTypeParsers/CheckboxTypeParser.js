export function parseCheckboxToMarkdown(blockData) {
  let items = {}

  items = blockData.items.map((item) => {
    if (item.checked === true) {
      return `- [x] ${item.text}`
    }
    return `- [ ] ${item.text}`
  })

  return items.join('\n')
}
