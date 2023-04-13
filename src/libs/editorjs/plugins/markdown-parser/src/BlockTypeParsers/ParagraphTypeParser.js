export function parseParagraphToMarkdown(blockData) {
  return `${blockData.text}\n`
}

export function parseMarkdownToParagraph(blockData) {
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
