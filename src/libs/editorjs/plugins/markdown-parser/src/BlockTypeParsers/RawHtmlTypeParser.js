export function parseRawHtmlToMarkdown(blockData) {
  console.log('>>> RawHtml blocks:: ', blockData)

  return `> ${blockData.text}\n`
}

export function parseMarkdownToRawHtml(blockData) {
  const quoteData = {}

  // TODO

  return quoteData
}
