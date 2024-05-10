import classNames from 'classnames'
import { useEffect, useRef, useState } from 'react'

import styles from './styles.module.scss'

type ResizerProps = {
	onResize: (diffX: number) => void
	onOver: () => void
	className?: string
}

const Resizer: React.FC<ResizerProps> = ({ className, onResize, onOver }) => {
	const resizerRef = useRef<HTMLDivElement>(null)
	const [isDragging, setIsDragging] = useState(false)
	const [startX, setStartX] = useState(0)

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		setStartX(e.clientX)
		setIsDragging(true)
	}

	const handleMouseMove = (e: MouseEvent) => {
		if (!isDragging) return
		if (startX === 0) setStartX(e.clientX)

		const diffX = e.clientX - startX
		onResize(diffX)
	}

	const handleMouseUp = () => {
		setStartX(0)
		setIsDragging(false)
		onOver()
	}

	useEffect(() => {
		const mouseMoveHandler = (e: MouseEvent) => handleMouseMove(e)
		const mouseUpHandler = () => handleMouseUp()

		if (isDragging) {
			window.addEventListener('mousemove', mouseMoveHandler)
			window.addEventListener('mouseup', mouseUpHandler)
		}

		return () => {
			window.removeEventListener('mousemove', mouseMoveHandler)
			window.removeEventListener('mouseup', mouseUpHandler)
		}
	}, [isDragging, handleMouseMove, handleMouseUp])

	return <div ref={resizerRef} className={classNames(styles.Resizer, className)} onMouseDown={handleMouseDown}></div>
}

export default Resizer
