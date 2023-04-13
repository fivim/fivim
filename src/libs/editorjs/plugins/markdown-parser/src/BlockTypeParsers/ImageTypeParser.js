export function parseImageToMarkdown(blockData) {
  return `![${blockData.caption}](${blockData.file.url} "${blockData.caption}")`.concat('\n')
}
