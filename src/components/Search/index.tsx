import { Button, Form, Input } from 'antd'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useRef, useState } from 'react'

import { InteractionOutlined, SearchOutlined } from '@ant-design/icons'
import Icon from '@ant-design/icons'
import { CN_TEMP_ELE_HIGHLIGHT, FindAndReplace, FormatTaName, TN_SPAN } from '@exsied/exsied'

import { CN_WORKPLACE_CODEMIRROR, CN_WORKPLACE_EXSIED, EXT_HTML_LIKE } from '@/constants'
import i18n from '@/i18n'
import RegexSvg from '@/icons/regex.svg?react'
import { invoker } from '@/invoker'
import { SearchFileRes } from '@/invoker/types'
import globalStore from '@/stores/globalStore'
import settingStore from '@/stores/settingStore'
import { pathToRelPath } from '@/stores_utils/path'
import { Func_Empty_Void } from '@/types'

import styles from './styles.module.scss'

const t = i18n.t

const conf = {
	contentLength: 10,
	classNameFileMatch: 'file-match-block',
	classNameFileMatchItem: 'file-match-item',
}

interface Props {
	onOpenFile: (event: any, callback?: Func_Empty_Void) => Promise<void>
}

const Search: React.FC<Props> = ({ onOpenFile }) => {
	const [isReMode, setIsReMode] = useState(false)
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const toggleReMode = () => {
		setIsReMode(!isReMode)
	}

	const [replaceVisible, setReplaceVisible] = useState(false)

	const searchText = useRef<string>('')
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value: inputValue } = e.target
		searchText.current = inputValue
	}

	const replaceText = useRef<string>('')

	const handleReplaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value: inputValue } = e.target
		replaceText.current = inputValue
	}

	const [searchRes, setSearchRes] = useState<SearchFileRes[]>([])

	const searchAll = async () => {
		setIsLoading(true)
		const dir = settingStore.getUserFilesDir()
		const text = searchText.current
		const res = await invoker.searchInDir(dir, isReMode, text, conf.contentLength, '<b>', '</b>', EXT_HTML_LIKE)
		if (res) setSearchRes(res)
		setIsLoading(false)
	}

	const replaceAll = () => {
		console.log('>>> replaceAll', replaceText.current)
	}

	const showInFile = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		let ele = event.target as HTMLElement
		if (!ele.classList.contains(conf.classNameFileMatchItem)) {
			ele = ele.closest(`.${conf.classNameFileMatchItem}`) as HTMLElement
		}
		const eleF = ele.closest(`.${conf.classNameFileMatch}`)
		const path = eleF?.getAttribute('data-file-path')
		if (!path) return

		const dataIndex = ele.getAttribute('data-index')
		const index = parseInt(dataIndex || '')

		await onOpenFile(path, () => {
			// in Exsied
			const workplaceExsiedEle = document.querySelector(`.${CN_WORKPLACE_EXSIED}`)
			if (workplaceExsiedEle) {
				const ranges = FindAndReplace.findRanges(workplaceExsiedEle as HTMLElement, searchText.current)
				if (!ranges) return

				const range = ranges[index]
				FormatTaName.formatSelected(TN_SPAN, range, `${CN_TEMP_ELE_HIGHLIGHT}`)

				const ele = document.querySelector(`.${CN_TEMP_ELE_HIGHLIGHT}`)
				if (ele) {
					ele.scrollIntoView({
						behavior: 'smooth',
						block: 'center',
					})
				}

				return
			}

			// in codemirror
			const workplaceCmEle = document.querySelector(`.${CN_WORKPLACE_CODEMIRROR}`)
			if (workplaceCmEle) {
				// TODO:
				return
			}
		})
	}

	return (
		<div className={styles.Search}>
			<span className="text-bold highlight-color2"> {t('Search')} </span>

			{/* serach */}
			<Form>
				<Form.Item>
					<div className={styles.SearchLine}>
						{/* 						
						<span className={styles.Left} onClick={toggleReplaceVisible}>
							{!replaceVisible && <DownOutlined />}
							{replaceVisible && <UpOutlined />}
						</span>
						*/}

						<Input onChange={handleSearchChange} />

						<span className={styles.Right}>
							<Button type="text" onClick={toggleReMode}>
								<Icon component={RegexSvg} style={{ color: isReMode ? 'var(--fvm-warning-clr)' : '' }} />
							</Button>
							<Button type="text" onClick={searchAll}>
								<SearchOutlined />
							</Button>
						</span>
					</div>
				</Form.Item>
			</Form>

			{/* replace */}
			<Form>
				{replaceVisible && (
					<Form.Item>
						<div className={styles.SearchLine}>
							<Input onChange={handleReplaceChange} />

							<span className={styles.Right} onClick={replaceAll}>
								<InteractionOutlined />
							</span>
						</div>
					</Form.Item>
				)}
			</Form>

			<div className={styles.SearchResult}>
				{searchRes.length > 0 ? (
					<>
						{searchRes.map((fileData, fileIndex) => {
							return (
								<div
									className={classNames(styles.SearchResultItem, conf.classNameFileMatch)}
									data-file-path={fileData.path}
									key={fileIndex}
								>
									<div className={styles.FilePath}>{pathToRelPath(fileData.path)}</div>
									<div className={styles.FileMatches}>
										{fileData.matches.map((matchedText, matcheIndex) => {
											return (
												<div
													className={classNames(styles.FileMatch, conf.classNameFileMatchItem)}
													data-index={matcheIndex}
													onClick={showInFile}
													dangerouslySetInnerHTML={{ __html: matchedText }}
												></div>
											)
										})}
									</div>
								</div>
							)
						})}
					</>
				) : (
					<div> {isLoading ? t('Loading') : t('None')}</div>
				)}
			</div>
		</div>
	)
}

export default observer(Search)
