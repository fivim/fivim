// Based on https://www.npmjs.com/package/@uiw/react-codemirror
import { basicSetup } from 'codemirror'
import { useEffect, useState } from 'react'

import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { search, searchKeymap } from '@codemirror/search'
import { Annotation, EditorState, type Extension, StateEffect } from '@codemirror/state'
import { EditorView, type ViewUpdate, keymap } from '@codemirror/view'

const External = Annotation.define<boolean>()

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
	onCreateEditor?(view: EditorView, state: EditorState): void
	onChange?(value: string, viewUpdate: ViewUpdate): void
	onUpdate?(viewUpdate: ViewUpdate): void
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
		onUpdate,
		onCreateEditor,
	} = props
	const [container, setContainer] = useState<HTMLDivElement | null>()
	const [view, setView] = useState<EditorView>()
	const [state, setState] = useState<EditorState>()
	const defaultThemeOption = EditorView.theme({
		'&': {
			height,
			minHeight,
			maxHeight,
			width,
			minWidth,
			maxWidth,
		},
		'& .cm-scroller': {
			height: '100% !important',
		},
	})

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

	let getExtensions = [
		basicSetup,
		history(),
		search({
			top: true,
		}),
		keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
		updateListener,
		defaultThemeOption,
		// EditorView.updateListener.of(function (e) {
		// 	const val = e.state.doc.toString()
		// 	console.log('>> updateListener val::: ', val)
		// }),
	]

	if (onUpdate && typeof onUpdate === 'function') {
		getExtensions.push(EditorView.updateListener.of(onUpdate))
	}
	getExtensions = getExtensions.concat(extensions)

	useEffect(() => {
		if (container && !state) {
			const config = {
				doc: value,
				extensions: getExtensions,
			}
			const stateCurrent = EditorState.create(config)
			setState(stateCurrent)
			if (!view) {
				const viewCurrent = new EditorView({
					state: stateCurrent,
					parent: container,
					root,
				})
				setView(viewCurrent)
				onCreateEditor && onCreateEditor(viewCurrent, stateCurrent)
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
			view.dispatch({ effects: StateEffect.reconfigure.of(getExtensions) })
		}
	}, [extensions, onChange, onUpdate])

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
