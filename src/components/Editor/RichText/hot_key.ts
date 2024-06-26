/**
 * Shortcut keys, similar to the function of an Markdown editor, are used to input shortcut characters first,
 * then press shift and space. The shortcut functions and shortcut characters are as follows:
 *
 * Title:#
 * Quote:>
 * italic:_
 * Bold:**
 * Split line:***
 * Unordered list:-
 * Ordered list: 1
 * Table:|||
 * Code block:```
 * Link:[
 * Image:!
 *
 */
import { v4 as uuidv4 } from 'uuid'

export const RE_BOLD = /^(\s*)(\*\*)(\s*)$/
export const RE_CODE_BLOCK = /^(\s*)(```)(\s*)$/
export const RE_H1 = /^(\s*)(#)(\s*)$/
export const RE_H2 = /^(\s*)(##)(\s*)$/
export const RE_H3 = /^(\s*)(###)(\s*)$/
export const RE_H4 = /^(\s*)(####)(\s*)$/
export const RE_H5 = /^(\s*)(#####)(\s*)$/
export const RE_H6 = /^(\s*)(######)(\s*)$/
export const RE_IMAGE = /^(\s*)(!)(\s*)$/
export const RE_ITALIC = /^(\s*)(\_)(\s*)$/
export const RE_HORIZONTAL_LINE = /^(\s*)(\*\*\*)(\s*)$/
export const RE_LINK = /^(\s*)(\[)(\s*)$/
export const RE_LIST_ORDERED = /^(\s*)(1)(\s*)$/
export const RE_LIST_UNORDERED = /^(\s*)(-)(\s*)$/
export const RE_QUOTE = /^(\s*)(>)(\s*)$/
export const RE_TABLE = /^(\s*)(\|\|\|)(\s*)$/

export const PLACE_HOLDER_TEXT = '\u200B'
export const PLACE_HOLDER_IMG_SRC =
	'data:image/svg+xml;base64,PHN2ZyB0PSIxNzE0Mjg0MDU1OTg5IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE1NDQiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNOTE3LjA5OTUyIDg0LjY4NDhIMTE0LjQxMTUyYy0zMi44Mzk2OCAwLTU5LjQ1ODU2IDI2LjYyNC01OS40NTg1NiA1OS40NTg1NnY3NzIuOTYxMjhjMCAzMi44MzQ1NiAyNi42MjQgNTkuNDUzNDQgNTkuNDU4NTYgNTkuNDUzNDRoODAyLjY4OGMzMi44MzQ1NiAwIDU5LjQ1MzQ0LTI2LjYxODg4IDU5LjQ1MzQ0LTU5LjQ1MzQ0VjE0NC4xMzgyNGMwLTMyLjgyOTQ0LTI2LjYxODg4LTU5LjQ1MzQ0LTU5LjQ1MzQ0LTU5LjQ1MzQ0eiIgZmlsbD0iIiBwLWlkPSIxNTQ1Ij48L3BhdGg+PHBhdGggZD0iTTkxNy4wOTk1MiA1NC45NTI5NkgxMTQuNDExNTJjLTMyLjgzOTY4IDAtNTkuNDU4NTYgMjYuNjI0LTU5LjQ1ODU2IDU5LjQ1ODU2Vjg4Ny4zNTIzMmMwIDMyLjg0NDggMjYuNjI0IDU5LjQ2MzY4IDU5LjQ1ODU2IDU5LjQ2MzY4aDgwMi42ODhjMzIuODM0NTYgMCA1OS40NTM0NC0yNi42MTg4OCA1OS40NTM0NC01OS40NjM2OFYxMTQuNDExNTJjMC0zMi44MzQ1Ni0yNi42MTg4OC01OS40NTg1Ni01OS40NTM0NC01OS40NTg1NnoiIGZpbGw9IiNFQ0VBRTAiIHAtaWQ9IjE1NDYiPjwvcGF0aD48cGF0aCBkPSJNODcyLjUwNDMyIDExNC40MTE1MkgxNTkuMDA2NzJhNDQuNTk1MiA0NC41OTUyIDAgMCAwLTQ0LjU5NTIgNDQuNTk1MlY1OTAuMDc0ODhoODAyLjY4OFYxNTkuMDA2NzJhNDQuNTk1MiA0NC41OTUyIDAgMCAwLTQ0LjU5NTItNDQuNTk1MnoiIGZpbGw9IiM5OERDRjAiIHAtaWQ9IjE1NDciPjwvcGF0aD48cGF0aCBkPSJNNjEzLjYzNzEyIDQxMS41NTU4NGwtMTU0Ljk0MTQ0IDE3OC41MTkwNGgzMDkuODY3NTJ6IiBmaWxsPSIjNjk5QjU0IiBwLWlkPSIxNTQ4Ij48L3BhdGg+PHBhdGggZD0iTTU4Ni44MjM2OCA1OTAuMDc0ODhsLTIwNi41MzU2OC0yMzcuOTc3Ni0yMDYuNTQwOCAyMzcuOTc3NkgxMTQuNDExNTJWNjk0LjEyMzUyYTQ0LjU5NTIgNDQuNTk1MiAwIDAgMCA0NC41OTUyIDQ0LjU5NTJoNzEzLjQ5NzZhNDQuNTk1MiA0NC41OTUyIDAgMCAwIDQ0LjU5NTItNDQuNTk1MnYtMTA0LjA1Mzc2aC0zMzAuMjc1ODR6IiBmaWxsPSIjODBCQjY3IiBwLWlkPSIxNTQ5Ij48L3BhdGg+PHBhdGggZD0iTTc2OC40NDU0NCAyNjMuMDU1MzZtLTU5LjQ1ODU2IDBhNTkuNDU4NTYgNTkuNDU4NTYgMCAxIDAgMTE4LjkxNzEyIDAgNTkuNDU4NTYgNTkuNDU4NTYgMCAxIDAtMTE4LjkxNzEyIDBaIiBmaWxsPSIjRkZFNjhFIiBwLWlkPSIxNTUwIj48L3BhdGg+PC9zdmc+'

export type HotKeyRes = {
	html: string
	focusTag: string
}
export const processHotKey = (text: string): HotKeyRes => {
	if (text.match(RE_BOLD)) {
		// THERE MUST BE AT LEAST ONE CHARACTER INSIDE THE ELEMENT.
		return { html: `<strong>${PLACE_HOLDER_TEXT || '&nbsp;'}</strong>`, focusTag: 'strong' }
	}
	if (text.match(RE_CODE_BLOCK)) {
		// TODO:
		// return { html: genEmptyCodeBlock(), focusTag: 'div' }
		return { html: '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^', focusTag: 'div' }
	}
	if (text.match(RE_H1)) {
		return { html: `<h1 data-uuid="${uuidv4()}">${PLACE_HOLDER_TEXT}</h1>`, focusTag: 'h1' }
	}
	if (text.match(RE_H2)) {
		return { html: `<h2 data-uuid="${uuidv4()}">${PLACE_HOLDER_TEXT}</h2>`, focusTag: 'h2' }
	}
	if (text.match(RE_H3)) {
		return { html: `<h3 data-uuid="${uuidv4()}">${PLACE_HOLDER_TEXT}</h3>`, focusTag: 'h3' }
	}
	if (text.match(RE_H4)) {
		return { html: `<h4 data-uuid="${uuidv4()}">${PLACE_HOLDER_TEXT}</h4>`, focusTag: 'h4' }
	}
	if (text.match(RE_H5)) {
		return { html: `<h5 data-uuid="${uuidv4()}">${PLACE_HOLDER_TEXT}</h5>`, focusTag: 'h5' }
	}
	if (text.match(RE_H6)) {
		return { html: `<h6 data-uuid="${uuidv4()}">${PLACE_HOLDER_TEXT}</h6>`, focusTag: 'h6' }
	}
	if (text.match(RE_IMAGE)) {
		return { html: `<img style="width:100px;height:100px" src="${PLACE_HOLDER_IMG_SRC}"/>`, focusTag: '' }
	}
	if (text.match(RE_ITALIC)) {
		// THERE MUST BE AT LEAST ONE CHARACTER INSIDE THE ELEMENT.
		return { html: `<i>${PLACE_HOLDER_TEXT || '&nbsp;'}</i>`, focusTag: 'i' }
	}
	if (text.match(RE_HORIZONTAL_LINE)) {
		return { html: `<hr/>`, focusTag: 'hr' }
	}
	if (text.match(RE_LINK)) {
		// THERE MUST BE AT LEAST ONE CHARACTER INSIDE THE ELEMENT.
		return { html: `<a href="https://xxx.com">${PLACE_HOLDER_TEXT || 'xxx'}</a>`, focusTag: '' }
	}
	if (text.match(RE_LIST_UNORDERED)) {
		return {
			html: `
				<ul>
					<li>${PLACE_HOLDER_TEXT}</li>
					<li></li>
					<li></li>
				</ul>
				`,
			focusTag: 'ul',
		}
	}
	if (text.match(RE_LIST_ORDERED)) {
		return {
			html: `
				<ol>
					<li>${PLACE_HOLDER_TEXT}</li>
					<li></li>
					<li></li>
				</ol>`,
			focusTag: 'li',
		}
	}
	if (text.match(RE_QUOTE)) {
		return { html: `<blockquote>${PLACE_HOLDER_TEXT}</blockquote>`, focusTag: 'blockquote' }
	}
	if (text.match(RE_TABLE)) {
		return {
			html: `
				<table>
					<thead>
						<tr>
							<th>${PLACE_HOLDER_TEXT}</th>
							<th></th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td></td>
							<td></td>
							<td></td>
						</tr>
						<tr>
							<td></td>
							<td></td>
							<td></td>
						</tr>
					</tbody>
				</table>`,
			focusTag: 'th',
		}
	}

	return { html: text, focusTag: '' }
}
