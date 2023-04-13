export function parseHeaderToMarkdown(blockData) {
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

export function parseMarkdownToHeader(blockData) {
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
