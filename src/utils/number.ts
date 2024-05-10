/*
Default alphabet equivalent to base 62 number
*/
class BaseConverter {
	alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

	setAlphabet = (alphabet: string) => {
		this.alphabet = alphabet
	}

	decimalToText = (num: number): string => {
		const arr = []
		while (num > 0) {
			arr.push(this.alphabet[num % this.alphabet.length])
			num = Math.floor(num / this.alphabet.length)
		}
		return arr.reverse().join('')
	}

	textToDecimal = (baseNum: string): number => {
		baseNum = baseNum.split('').reverse().join('')
		let val = 0
		for (let i = 0; i < baseNum.length; i++) {
			const c = baseNum[i]
			val += this.alphabet.indexOf(c) * Math.pow(this.alphabet.length, i)
		}
		return val
	}
}

export { BaseConverter as DecimalConverter }

export const round = (num: number) => {
	return Math.round((num + Number.EPSILON) * 100) / 100
}
