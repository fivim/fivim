export function parseLinkToMarkdown(blockData) {
  return `[${blockData.meta.title}](${blockData.link})`
}
