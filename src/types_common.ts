export type ElPropPlacement = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end'

export type ElPropTrigger = 'click' | 'focus' | 'hover' | 'contextmenu'

export type ElOptionItem = { value: string, label: string }

export type ElPrecessItem = { color: string, percentage: number }

export type StringNumberObj = {
    [key: string]: number
}

export type StringStringObj = {
    [key: string]: string
}

export type NumberArray = number[]

export type Obj = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
}
