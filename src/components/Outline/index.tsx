import { observer } from 'mobx-react-lite'

import i18n from '@/i18n'
import globalStore from '@/stores/globalStore'
import { showOutline } from '@/stores_utils'
import { Func_Any_Void } from '@/types'

import styles from './styles.module.scss'

const t = i18n.t

interface Props {
	onClick?: Func_Any_Void
}

const Outline: React.FC<Props> = ({ onClick }) => {
	const GD = globalStore.getData()

	return (
		<div className={styles.Outline}>
			{showOutline() ? (
				<>
					<span className="text-bold highlight-color2"> {t('Outline')} </span>
					{GD.outlineHeadings.map((item, index) => (
						<div
							key={index}
							className={styles.listItem}
							style={{ paddingInlineStart: `${item.level}0px` }}
							onClick={(event) => {
								const editorEle = document.querySelectorAll(`[data-uuid="${item.uuid}"]`)
								if (editorEle.length > 0) {
									editorEle[0].scrollIntoView()
								}

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
