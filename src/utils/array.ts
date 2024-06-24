import { Base64 } from 'js-base64'

import { OptionItem, StringAnyObj } from '@/types'

/**
 * Split one-dimensional array to two-dimensional array by number
 * arrGrouping([1, 2, 3, 4, 5, 6, 7, 8, 9, 0],3)
 * @param {Array} arr - original array
 * @param {number} step - number of every group items
 * @returns {Array}
 */
export const arrayGrouping = (arr: Array<any>, step: number): Array<any> => {
	return arr.reduce((x, y) => {
		return Array.isArray(x) ? (x[x.length - 1].push(y) === step ? [...x, []] : x) : [[x, y]]
	})
}

/**
 * Convert ArrayBuffer to base64 string
 * Refer: https://www.isummation.com/blog/convert-arraybuffer-to-base64-string-and-vice-versa/
 * @param {number[]} buffer
 * @returns {string}
 */
export const arrayBufferToBase64 = (buffer: number[]) => {
	let binary = ''
	const bytes = new Uint8Array(buffer)
	const len = bytes.byteLength
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i])
	}
	return window.btoa(binary)
}

/**
 * Convert base64 string to ArrayBuffer
 * Refer: https://www.isummation.com/blog/convert-arraybuffer-to-base64-string-and-vice-versa/
 * @param {string} base64Str - base64 string
 * @returns {ArrayBufferLike}
 */
export const base64ToArrayBuffer = (base64Str: string) => {
	const binaryString = Base64.decode(base64Str) // Cannot use atob, there may be issues with Chinese character encoding
	const len = binaryString.length
	const bytes = new Uint8Array(len)
	for (let i = 0; i < len; i++) {
		bytes[i] = binaryString.charCodeAt(i)
	}
	return bytes.buffer
}

/**

OrderedFieldArrayTable id a converter for **Object Array** between **Field Array**.

Use Field Array will save more resources.

Object Array is a array with some object that have the same struct, demo:

```json
[
  {
    "sign": 1,
    "title": 2,
    "icon": 3,
    "summary": 4,
    "type": 5,
    "content": 6,
    "mtimeUtc": 7,
    "ctimeUtc": 8,
    "tagsSign": 9
  },
  {
    "sign": 11,
    "title": 22,
    "icon": 33,
    "summary": 44,
    "type": 55,
    "content": 66,
    "mtimeUtc": 77,
    "ctimeUtc": 88,
    "tagsSign": 99
  }
]
```

Field Array ia a bit like the HTML table which has a header and a body, demo:

```json
{
  "attrsArr": ["sign", "title", "icon", "summary", "type", "content", "mtimeUtc", "ctimeUtc", "tagsSign"],
  "dataArr": [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [11, 22, 33, 44, 55, 66, 77, 88, 99]
  ]
}
```
 */
type OfatKeysArr = string[]
export type OfatValuesItem = Array<unknown>
type OfatValuesArr = OfatValuesItem[]
type OfatToObjectArrayCallbackObj = {
	[key: string]: CallableFunction
}
type OfatFromObjectArrayCallbackObj = {
	[key: string]: (
		item: any,
		currentObj: object,
	) => {
		currentItemAfter: unknown
		moveToNewNewFieldName: string
	}
}
type OfatParsedArrayItem = { [key: string]: unknown }
type OfatParsedArray = OfatParsedArrayItem[]

// TODO: Not used
export class OrderedFieldArrayTable {
	keysArr: OfatKeysArr = []
	valuesArr: OfatValuesArr = []

	constructor(keysArr: OfatKeysArr) {
		this.keysArr = keysArr
	}

	// From Field Array(Keys And Values) to Object Array

	fromFieldArray(keysArr: OfatKeysArr, valuesArr: OfatValuesArr) {
		this.keysArr = keysArr
		this.valuesArr = valuesArr
	}

	toObjectArray(callbackObj: OfatToObjectArrayCallbackObj) {
		const res: OfatParsedArray = []
		for (let vi = 0; vi < this.valuesArr.length; vi++) {
			const vArr = this.valuesArr[vi]
			const item: OfatParsedArrayItem = {}
			for (let ki = 0; ki < this.keysArr.length; ki++) {
				const key = this.keysArr[ki]
				if (Object.prototype.hasOwnProperty.call(callbackObj, ki)) {
					item[key] = callbackObj[ki](vArr[ki])
				} else {
					item[key] = vArr[ki]
				}
			}
			res.push(item)
		}
		return res
	}

	// From Object Array to Field Array

	fromObjectArray(objArr: StringAnyObj[], callbackObj: OfatFromObjectArrayCallbackObj) {
		if (objArr.length === 0) {
			return
		}

		// Get keys of the first item
		if (this.keysArr.length === 0) {
			this.keysArr = Object.keys(objArr[0])
		}

		const values: OfatValuesArr = []
		for (const obj of objArr) {
			const valuesSub: OfatValuesItem = new Array(this.keysArr.length)
			for (let index = 0; index < this.keysArr.length; index++) {
				const k = this.keysArr[index]

				if (Object.prototype.hasOwnProperty.call(obj, k)) {
					if (Object.prototype.hasOwnProperty.call(callbackObj, k)) {
						const res = callbackObj[k](obj[k], obj)
						const newValue = res.currentItemAfter
						if (res.moveToNewNewFieldName === '') {
							valuesSub[index] = newValue
						} else {
							// move to new field
							const idx = this.keysArr.indexOf(res.moveToNewNewFieldName)
							if (idx) {
								valuesSub[idx] = newValue
							}
						}
					} else {
						valuesSub[index] = obj[k]
					}
				}
			}
			values.push(valuesSub)
		}

		this.valuesArr = values
	}

	toFieldArray() {
		return {
			keysArr: this.keysArr,
			valuesArr: this.valuesArr,
		}
	}
}

//
export const elOptionArrSort = (a: OptionItem, b: OptionItem) => {
	const label1 = a.label.toLowerCase()
	const label2 = b.label.toLowerCase()

	if (label1 > label2) {
		return 1
	}
	if (label1 < label2) {
		return -1
	}
	return 0
}
