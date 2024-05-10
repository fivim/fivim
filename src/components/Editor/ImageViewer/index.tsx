// https://blog.logrocket.com/adding-zoom-pan-pinch-react-web-apps/
import React from 'react'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'

import { MarginIcon, ResetIcon, ZoomInIcon, ZoomOutIcon } from '@radix-ui/react-icons'

import styles from './styles.module.scss'

interface Props {
	src: string
}

export const ImageViewer: React.FC<Props> = ({ src }) => {
	return (
		<>
			<TransformWrapper>
				{({ zoomIn, zoomOut, resetTransform, centerView, ...rest }) => (
					<React.Fragment>
						<div className={styles.toolbar}>
							<ZoomInIcon className={styles.btn} onClick={() => zoomIn()} />
							<ZoomOutIcon className={styles.btn} onClick={() => zoomOut()} />
							<ResetIcon className={styles.btn} onClick={() => resetTransform()} />
							<MarginIcon className={styles.btn} onClick={() => centerView()} />
						</div>
						<TransformComponent>
							<img src={src} style={{ maxWidth: '100vw' }} />
						</TransformComponent>
					</React.Fragment>
				)}
			</TransformWrapper>
		</>
	)
}
