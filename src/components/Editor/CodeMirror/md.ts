import { marked } from 'marked'

export const md2html = async (md: string) => {
	const htmlString = marked.parse(md) as string
	return htmlString
}
