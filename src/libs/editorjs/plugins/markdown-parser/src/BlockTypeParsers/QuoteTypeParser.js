export function parseQuoteToMarkdown(blockData) {
  return `> ${blockData.text}\n`
}

export function parseMarkdownToQuote(blockData) {
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
