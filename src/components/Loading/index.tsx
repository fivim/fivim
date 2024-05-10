/**
 * https://uiverse.io/barisdogansutcu/light-rat-32
 */
import { observer } from 'mobx-react-lite'

import styles from './styles.module.scss'

const Loading: React.FC = () => {
	return (
		<div className={styles.Loading}>
			<svg viewBox="25 25 50 50">
				<circle r="20" cy="50" cx="50"></circle>
			</svg>
		</div>
	)
}

export default observer(Loading)
