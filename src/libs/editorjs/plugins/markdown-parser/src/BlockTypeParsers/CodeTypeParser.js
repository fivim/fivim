export function parseCodeToMarkdown(blockData) {
  return `\`\`\`\n${blockData.code}\n\`\`\`\n`
}

export function parseMarkdownToCode(blockData) {
  const codeData = {
    data: {
      code: blockData.value
    },
    type: 'code'
  }

  return codeData
}
