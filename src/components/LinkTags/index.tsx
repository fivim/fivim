import classNames from 'classnames'
import { decode } from 'he'
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'

import { CN_WORKPLACE_CODEMIRROR, CN_WORKPLACE_EXSIED } from '@/constants'
import i18n from '@/i18n'
import { invoker } from '@/invoker'
import { SearchFileRes } from '@/invoker/types'
import globalStore from '@/stores/globalStore'
import settingStore from '@/stores/settingStore'
import { pathToRelPath } from '@/stores_utils/path'
import { Func_Empty_Void } from '@/types'
import { removeHtmlTags } from '@/utils/html'
import { insertStringAt } from '@/utils/string'

import { DATA_ATTR_LINK_TAG_NAME } from '../Editor/RichText/exsied/plugins/link_tag/base'
import styles from './styles.module.scss'

const t = i18n.t
const reText = `${DATA_ATTR_LINK_TAG_NAME}=["']([^"']+)["']`
const tagNamePattern = new RegExp(reText)
const tagPlaceholder = '«fivim-tag»'

function outputMatch(str: string) {
	let res = decode(removeHtmlTags(str))
	res = res.replace(tagPlaceholder, '<i class="exsied-icon-link-tag"></i>')
	return res
}

const conf = {
	contentLength: 10,
	classNameFileMatch: 'file-match-block',
	classNameFileMatchItem: 'file-match-item',
}

interface Props {
	onOpenFile: (event: any, callback?: Func_Empty_Void) => Promise<void>
}

const LinkTags: React.FC<Props> = ({ onOpenFile }) => {
	const GD = globalStore.getData()

	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [currentTagName, setCurrentTagName] = useState<string>('')
	const [searchRes, setSearchRes] = useState<SearchFileRes[]>([])

	const [outboundLinks, setOutboundLinks] = useState<SearchFileRes[]>([])
	const [inboundLinks, setInboundLinks] = useState<SearchFileRes[]>([])

	const searchAllLinkTags = async () => {
		setIsLoading(true)
		const dir = settingStore.getUserFilesDir()

		const res = await invoker.searchInDir(dir, true, reText, 100, '', '', [])
		if (!res) return

		res.map((file, fileIndex) => {
			file.matches.map((matche, matcheIndex) => {
				const ttt = tagNamePattern.exec(matche)
				if (ttt && ttt.length >= 2) {
					const text = ttt[1]

					const index = matche.indexOf('>', matche.indexOf(text) + text.length)
					const precessed = insertStringAt(matche, index + 1, tagPlaceholder)

					res[fileIndex].matches[matcheIndex] = precessed
				}
			})
		})

		setSearchRes(res)
		setIsLoading(false)

		res.map((fileData, fileIndex) => {
			if (fileData.path === GD.currentFilePath) {
				setOutboundLinks([fileData])
			} else {
				setInboundLinks([fileData])
			}
		})
	}

	useEffect(() => {
		setTimeout(searchAllLinkTags, 200)
	}, [])

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
				const eles = workplaceExsiedEle.querySelectorAll(`[${DATA_ATTR_LINK_TAG_NAME}="${currentTagName}"]`)
				if (eles) {
					const ele = eles[index]
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
		<>
			<div className={styles.Tags}>
				<>
					<span className="text-bold highlight-color2"> {t('Link tags')} </span>

					{searchRes.length > 0 ? (
						<>
							<div className={styles.TagsList}>
								<span className="highlight-color2"> {t('Outbound link tags')} </span>

								{outboundLinks.map((fileData, fileIndex) => {
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
														></div>
													)
												})}
											</div>
										</div>
									)
								})}
							</div>
							<div className={styles.TagsList}>
								<span className="highlight-color2"> {t('Inbound link tags')} </span>

								{inboundLinks.map((fileData, fileIndex) => {
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
														></div>
													)
												})}
											</div>
										</div>
									)
								})}
							</div>
						</>
					) : (
						<div> {isLoading ? t('Loading') : t('None')}</div>
					)}
				</>
			</div>
		</>
	)
}

export default observer(LinkTags)
