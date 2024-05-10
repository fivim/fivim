import { action, makeAutoObservable, observable } from 'mobx'

import { genPwdArr, genPwdVec } from '@/utils/utils'

class RunningStore {
	data: number[] = []

	constructor() {
		makeAutoObservable(
			this,
			{
				data: observable,
				setData: action,
			},
			{ autoBind: true },
		)
	}

	getData = () => {
		const res = genPwdArr([...this.data])
		return res
	}

	setData = (val: string) => {
		const vec = genPwdVec(val)
		this.data = vec
	}
}

export default new RunningStore()
