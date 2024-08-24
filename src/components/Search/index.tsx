import { Button, Form, Input } from 'antd'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useRef, useState } from 'react'

import { InteractionOutlined, SearchOutlined } from '@ant-design/icons'
import Icon from '@ant-design/icons'
import { CN_TEMP_ELE_HIGHLIGHT, FindAndReplace, FormatTaName, TN_SPAN } from '@exsied/exsied'

import Collapsible from '@/components/Collapsible'
import { CN_WORKPLACE_ACE, CN_WORKPLACE_EXSIED, EXT_HTML_LIKE } from '@/constants'
import i18n from '@/i18n'
import RegexSvg from '@/icons/regex.svg?react'
import { invoker } from '@/invoker'
import { SearchFileRes } from '@/invoker/types'
import { pathToRelPath } from '@/stores_utils/path'

import { EditorSetContentCallback } from '../Editor'
import styles from './styles.module.scss'
import globalStore from '@/stores/globalStore'

const t = i18n.t

const contentLength = 10

interface Props {
	onOpenFile: (event: any, callback?: EditorSetContentCallback) => Promise<void>
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
		const dir = globalStore.data.paths.userFiles
		const text = searchText.current
		const res = await invoker.searchInDir(dir, isReMode, text, contentLength, '<b>', '</b>', EXT_HTML_LIKE)
		if (res) setSearchRes(res)
		setIsLoading(false)
	}

	const replaceAll = () => {
		console.log('>>> replaceAll', replaceText.current)
	}

	const showInFile = async (path: string, index: number) => {
		await onOpenFile(path, (func) => {
			// in Exsied
			const workplaceExsied = document.querySelector(`.${CN_WORKPLACE_EXSIED}`)
			if (workplaceExsied) {
				const ranges = FindAndReplace.findRanges(workplaceExsied as HTMLElement, searchText.current)
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

			// in Ace
			const workplaceAce = document.querySelector(`.${CN_WORKPLACE_ACE}`)
			if (workplaceAce) {
				func({
					findText: searchText.current,
					findTextIndex: index,
				})
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
								<Collapsible
									key={fileIndex}
									title={pathToRelPath(fileData.path)}
									dataArray={fileData.matches.map((matchedText, matcheIndex) => {
										return (
											<div
												className={classNames(styles.FileMatch, 'cur-ptr', 'pis-4', 'py-1')}
												onClick={() => {
													showInFile(fileData.path, matcheIndex)
												}}
												dangerouslySetInnerHTML={{ __html: matchedText }}
												key={`${fileIndex}-${matcheIndex}`}
											></div>
										)
									})}
								/>
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
