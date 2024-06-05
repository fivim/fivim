import React, { useEffect, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { OnDocumentLoadSuccess } from 'react-pdf/dist/cjs/shared/types'

import { CaretLeftIcon, CaretRightIcon, ResetIcon, ZoomInIcon, ZoomOutIcon } from '@radix-ui/react-icons'

import styles from './styles.module.scss'

// if (typeof window !== 'undefined' && 'Worker' in window) {
// 	pdfjs.GlobalWorkerOptions.workerPort = new Worker('/worker/pdf.worker.min.mjs')
// }

// The version of pdf.worker must as same as pdfjs.version
// The link like https://cdn.jsdelivr.net/npm/pdfjs-dist@4.3.136/build/pdf.worker.min.mjs
// console.log(`pdfjs.version :: ${pdfjs.version}`)
const workerSrc = `${window.location.protocol}//${window.location.host}/worker/pdf.worker.min.mjs`
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

interface Props {
	base64Str: string
}

export const PdfViewer: React.FC<Props> = ({ base64Str }) => {
	const [numPages, setNumPages] = useState(0)
	const [pageNumber, setPageNumber] = useState(1)
	const [renderedPageNumber, setRenderedPageNumber] = useState(0)
	const [scale, setScale] = useState(1)
	const scaleStep = 0.2

	const onDocumentLoadSuccess: OnDocumentLoadSuccess = (document) => {
		setNumPages(document.numPages)
	}

	function changePage(offset: number) {
		setPageNumber((prevPageNumber) => prevPageNumber + offset)
	}

	function previousPage() {
		changePage(-1)
	}

	function nextPage() {
		changePage(1)
	}

	const zoomIn = () => {
		setScale(scale + scaleStep)
	}

	const zoomOut = () => {
		setScale(scale - scaleStep)
	}

	const zoomRest = () => {
		setScale(1)
	}

	const isLoading = renderedPageNumber !== pageNumber

	useEffect(() => {
		setPageNumber(1)
	}, [base64Str])

	return (
		<>
			<div className={styles.toolbar}>
				<span>
					<CaretLeftIcon className={styles.btn} onClick={() => previousPage()} />
					<CaretRightIcon className={styles.btn} onClick={() => nextPage()} />
				</span>
				<span>
					<span>{pageNumber}</span> / <span>{numPages}</span>
				</span>
				<span>
					<ResetIcon className={styles.btn} onClick={() => zoomRest()} />
					<ZoomOutIcon className={styles.btn} onClick={() => zoomOut()} />
					<ZoomInIcon className={styles.btn} onClick={() => zoomIn()} />
				</span>
			</div>
			<div className={styles.viewer}>
				<Document file={base64Str} onLoadSuccess={onDocumentLoadSuccess}>
					{isLoading && renderedPageNumber ? (
						<Page key={renderedPageNumber} className="prevPage" pageNumber={renderedPageNumber} />
					) : null}
					<Page
						key={pageNumber}
						pageNumber={pageNumber}
						scale={scale}
						onRenderSuccess={() => setRenderedPageNumber(pageNumber)}
					/>
				</Document>
			</div>
		</>
	)
}
