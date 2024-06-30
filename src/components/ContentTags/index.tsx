import { Modal } from 'antd'
import classNames from 'classnames'
import { decode } from 'he'
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'

import { CN_WORKPLACE_ACE, CN_WORKPLACE_EXSIED } from '@/constants'
import i18n from '@/i18n'
import { invoker } from '@/invoker'
import { SearchFileRes } from '@/invoker/types'
import settingStore from '@/stores/settingStore'
import { pathToRelPath } from '@/stores_utils/path'
import { StringStringObj } from '@/types'
import { removeHtmlTags } from '@/utils/html'
import { insertStringAt } from '@/utils/string'

import { EditorSetContentCallback } from '../Editor'
import { DATA_ATTR_CONTENT_TAG_NAME } from '../Editor/RichText/exsied/plugins/content_tag/base'
import styles from './styles.module.scss'

const t = i18n.t
export const reText = `${DATA_ATTR_CONTENT_TAG_NAME}=["']([^"']+)["']`
export const tagNamePattern = new RegExp(reText)
const tagPlaceholder = '«fivim-tag»'

function outputMatch(str: string) {
	let res = decode(removeHtmlTags(str))
	res = res.replace(tagPlaceholder, '<i class="exsied-icon-content-tag"></i>')
	return res
}

const conf = {
	contentLength: 10,
	classNameFileMatch: 'file-match-block',
	classNameFileMatchItem: 'file-match-item',
}

interface Props {
	onOpenFile: (event: any, callback?: EditorSetContentCallback) => Promise<void>
}

const ContentTags: React.FC<Props> = ({ onOpenFile }) => {
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [currentTagName, setCurrentTagName] = useState<string>('')
	const [searchRes, setSearchRes] = useState<SearchFileRes[]>([])
	const [selectedTagData, setSelectedTagData] = useState<SearchFileRes[]>([])
	const [allTageNames, setAllTageNames] = useState<StringStringObj>({})

	const searchAllContentTags = async () => {
		setIsLoading(true)
		const dir = settingStore.getUserFilesDir()

		const res = await invoker.searchInDir(dir, true, reText, 100, '', '', [])
		if (!res) return

		const temp: StringStringObj = {}
		res.map((file, fileIndex) => {
			file.matches.map((matche, matcheIndex) => {
				const ttt = tagNamePattern.exec(matche)
				if (ttt && ttt.length >= 2) {
					const text = ttt[1]
					temp[text] = ''

					const index = matche.indexOf('>', matche.indexOf(text) + text.length)
					const precessed = insertStringAt(matche, index + 1, tagPlaceholder)

					res[fileIndex].matches[matcheIndex] = precessed
				}
			})
		})

		setAllTageNames(temp)
		setSearchRes(res)
		setIsLoading(false)
	}

	const showContentTagItems = async (tagName: string) => {
		const temp: SearchFileRes[] = []

		setCurrentTagName(tagName)

		searchRes.map((fileData, fileIndex) => {
			fileData.matches.map((matchedText, matcheIndex) => {
				const ttt = tagNamePattern.exec(matchedText)
				if (ttt && ttt.length >= 2 && tagName === ttt[1]) {
					let existFileIndex = -1
					for (let index = 0; index < temp.length; index++) {
						const iterator = temp[index]

						if (iterator.path === fileData.path) {
							existFileIndex = index
							break
						}
					}

					if (existFileIndex > -1) {
						temp[existFileIndex].matches.push(matchedText)
					} else {
						temp.push({
							path: fileData.path,
							matches: [matchedText],
						})
					}
				}
			})
		})

		setSelectedTagData(temp)
		setShowModal(true)
	}

	useEffect(() => {
		setTimeout(searchAllContentTags, 100)
	}, [])

	const [showModal, setShowModal] = useState<boolean>(true)
	const handleOk = (event: any) => {
		setSelectedTagData([])
		setShowModal(false)
	}

	const handleCancel = (event: any) => {
		setSelectedTagData([])
		setShowModal(false)
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

		await onOpenFile(path, (func) => {
			// in Exsied
			const workplaceExsiedEle = document.querySelector(`.${CN_WORKPLACE_EXSIED}`)
			if (workplaceExsiedEle) {
				const eles = workplaceExsiedEle.querySelectorAll(`[${DATA_ATTR_CONTENT_TAG_NAME}="${currentTagName}"]`)
				if (eles) {
					const ele = eles[index]
					ele.scrollIntoView({
						behavior: 'smooth',
						block: 'center',
					})
				}

				setSelectedTagData([])
				setShowModal(false)

				return
			}

			// in Ace
			const workplaceAce = document.querySelector(`.${CN_WORKPLACE_ACE}`)
			if (workplaceAce) {
				func({
					findText: currentTagName,
					findTextIndex: index,
				})
			}
		})
	}

	return (
		<>
			<div className={styles.Tags}>
				<>
					<span className="text-bold highlight-color2"> {t('Content tags')} </span>
					<div className={styles.TagsList}>
						{Object.keys(allTageNames).length > 0 ? (
							<>
								{Object.keys(allTageNames).map((key, value) => {
									return (
										<span
											className={styles.TagItem}
											onClick={() => {
												showContentTagItems(key)
											}}
										>
											{key}
										</span>
									)
								})}
							</>
						) : (
							<div> {isLoading ? t('Loading') : t('None')}</div>
						)}
					</div>
				</>
			</div>

			{selectedTagData.length > 0 && (
				<Modal
					title={t('Content tags')}
					okText={t('OK')}
					cancelText={t('Cancel')}
					open={showModal}
					onOk={handleOk}
					onCancel={handleCancel}
					className="mfcw"
					style={{ overflowX: 'hidden', overflowY: 'scroll' }}
				>
					<div className={classNames('exsied-workplace-like')}>
						{selectedTagData.map((fileData, fileIndex) => {
							return (
								<div
									className={classNames(styles.SearchResultItem, conf.classNameFileMatch)}
									data-file-path={fileData.path}
									key={fileIndex}
								>
									<div className={styles.FilePath}>
										<b>{pathToRelPath(fileData.path)}</b>
									</div>
									<div className={classNames(styles.FileMatches, 'pis-4')}>
										{fileData.matches.map((matchedText, matcheIndex) => {
											return (
												<div
													className={classNames(styles.FileMatch, conf.classNameFileMatchItem, 'cur-ptr')}
													data-index={matcheIndex}
													onClick={showInFile}
													dangerouslySetInnerHTML={{ __html: outputMatch(matchedText) }}
													key={`${fileIndex}-${matcheIndex}`}
												></div>
											)
										})}
									</div>
								</div>
							)
						})}
					</div>
				</Modal>
			)}
		</>
	)
}

export default observer(ContentTags)
