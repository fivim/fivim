import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { forwardRef } from 'react'

import styles from './styles.module.scss'

type Props = {
	width: string
	children?: React.ReactNode
	className?: string
}

const SideBar = forwardRef<HTMLDivElement, Props>(({ width, children, className }, ref) => {
	const style = { width: width }
	return (
		<div className={classNames(styles.SideBarDesktop, className, 'user-select-none')} style={style} ref={ref}>
			{children}
		</div>
	)
})

export default observer(SideBar)
