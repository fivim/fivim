import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'

import i18n from '@/i18n'
import globalStore from '@/stores/globalStore'
import { showOutline } from '@/stores_utils'
import { Func_Any_Void, StringNumberObj } from '@/types'

import styles from './styles.module.scss'

const t = i18n.t

interface Props {
	onClick?: Func_Any_Void
}

const Outline: React.FC<Props> = ({ onClick }) => {
	const GD = globalStore.getData()

	let indexs: StringNumberObj = {}

	function reset() {
		indexs = {}
	}

	function click(index: number) {
		reset()

		const arr = GD.outlineHeadings.slice(0, index)
		for (let i = 0; i < arr.length; i++) {
			const item = arr[i]
			const level = item.level

			const key = `h${level}`
			if (key in indexs) {
				indexs[key] = indexs[key] + 1
			} else {
				indexs[key] = 1
			}
		}

		const lastElement = arr[arr.length - 1]
		if (!lastElement) return

		const headings = document.querySelectorAll(`h${lastElement.level}`)

		if (headings.length > 0) {
			const level = lastElement.level
			const index = indexs[`h${level}`] - 1
			headings[index].scrollIntoView()
		}
	}

	function genStyle(level: number) {
		return `${level}0px`
	}

	useEffect(() => {
		reset()
	}, [])

	return (
		<div className={styles.Outline}>
			{showOutline() ? (
				<>
					<span className="text-bold highlight-color2"> {t('Outline')} </span>
					{GD.outlineHeadings.map((item, index) => (
						<div
							key={index}
							className={styles.listItem}
							style={{ paddingInlineStart: `${genStyle(item.level)}` }}
							onClick={(event) => {
								click(index + 1)

								// const editorEle = document.querySelectorAll(`[data-uuid="${item.uuid}"]`)
								// if (editorEle.length > 0) {
								// 	editorEle[0].scrollIntoView()
								// }

								if (onClick) onClick(event)
							}}
						>
							{item.text}
						</div>
					))}
				</>
			) : (
				<>
					<div>{t('None')}</div>
				</>
			)}
		</div>
	)
}

export default observer(Outline)
