// Based on https://www.npmjs.com/package/@uiw/react-codemirror
import { basicSetup } from 'codemirror'
import { useEffect, useState } from 'react'

import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { search, searchKeymap } from '@codemirror/search'
import { Annotation, EditorState, type Extension, StateEffect } from '@codemirror/state'
import { EditorView, type ViewUpdate, keymap } from '@codemirror/view'

const External = Annotation.define<boolean>()
export type CodeMirrorOnChange = (value: string, viewUpdate: ViewUpdate) => void

export function genDefaultThemeOption(
	height: string | null,
	minHeight: string | null,
	maxHeight: string | null,
	width: string | null,
	minWidth: string | null,
	maxWidth: string | null,
) {
	const option = EditorView.theme({
		'&': {
			height: height || null,
			minHeight: minHeight || null,
			maxHeight: maxHeight || null,
			width: width || null,
			minWidth: minWidth || null,
			maxWidth: maxWidth || null,
		},
		'& .cm-scroller': {
			height: '100% !important',
		},
	})
	return option
}

export function genExtensions(defaultThemeOption?: Extension, onChange?: CodeMirrorOnChange) {
	const exts = [
		basicSetup,
		history(),
		search({
			top: true,
		}),
		keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
	]
	if (defaultThemeOption) exts.push(defaultThemeOption)

	const updateListener = EditorView.updateListener.of((vu: ViewUpdate) => {
		if (
			vu.docChanged &&
			typeof onChange === 'function' &&
			// Fix echoing of the remote changes:
			// If transaction is market as remote we don't have to call `onChange` handler again
			!vu.transactions.some((tr) => tr.annotation(External))
		) {
			const doc = vu.state.doc
			const value = doc.toString()
			onChange(value, vu)
		}
	})

	exts.push(updateListener)
	return exts
}

export function initEditorState(html: string, extensions?: Extension[]) {
	const config = {
		doc: html,
		extensions: extensions,
	}
	const stateCurrent = EditorState.create(config)
	return stateCurrent
}

export function initEditorView(state: EditorState, parent: Element, root?: ShadowRoot | Document) {
	const viewCurrent = new EditorView({
		state: state,
		parent: parent,
		root,
	})

	return viewCurrent
}

export interface UseCodeMirror {
	value: string
	container?: HTMLDivElement | null
	extensions: Extension[]
	root?: ShadowRoot | Document
	height?: string
	minHeight?: string
	maxHeight?: string
	width?: string
	minWidth?: string
	maxWidth?: string
	onChange?: CodeMirrorOnChange
}

export function useCodeMirror(props: UseCodeMirror) {
	const {
		value,
		extensions,
		root,
		height = null,
		minHeight = null,
		maxHeight = null,
		width = null,
		minWidth = null,
		maxWidth = null,
		onChange,
	} = props
	const [container, setContainer] = useState<HTMLDivElement | null>()
	const [view, setView] = useState<EditorView>()
	const [state, setState] = useState<EditorState>()

	const defaultThemeOption = genDefaultThemeOption(height, minHeight, maxHeight, width, minWidth, maxWidth)
	let exts = genExtensions(defaultThemeOption, onChange)
	exts = exts.concat(extensions)

	useEffect(() => {
		if (container && !state) {
			const stateCurrent = initEditorState(value, exts)
			setState(stateCurrent)
			if (!view) {
				const viewCurrent = initEditorView(stateCurrent, container, root)
				setView(viewCurrent)
			}
		}
		return () => {
			if (view) {
				setState(undefined)
				setView(undefined)
			}
		}
	}, [container, state])

	useEffect(() => setContainer(props.container), [props.container])

	useEffect(
		() => () => {
			if (view) {
				view.destroy()
				setView(undefined)
			}
		},
		[view],
	)

	useEffect(() => {
		if (view) {
			view.dispatch({ effects: StateEffect.reconfigure.of(exts) })
		}
	}, [extensions, onChange])

	useEffect(() => {
		if (value === undefined) {
			return
		}
		const currentValue = view ? view.state.doc.toString() : ''
		if (view && value !== currentValue) {
			view.dispatch({
				changes: { from: 0, to: currentValue.length, insert: value || '' },
				annotations: [External.of(true)],
			})
		}
	}, [value, view])

	return { state, setState, view, setView, container, setContainer }
}
