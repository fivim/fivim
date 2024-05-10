import { MessageType } from '@/types'

export type InvokeArgs = Record<string, unknown>

export interface InvokeOptions {
	headers: Headers | Record<string, string>
}

export interface Commands {
	getName(): string
	invoke<T>(_cmd: string, _args?: InvokeArgs, _options?: InvokeOptions): Promise<T>
	showMessage(title: string, message: string, messageType: MessageType, showConfirmBtn: boolean): Promise<boolean>
	reoladWindow(): void
	pickFile(allowedExtensions?: string[]): Promise<string>
	pickFiles(allowedExtensions?: string[]): Promise<string[]>
}

export type WriteFileRes = {
	success: boolean
	errMsg: string
}

export type FileInfo = {
	size: number
	createdTime: string
	accessedTime: string
	modifiedTime: string
	errMsg: string
}

export type ProgressStatus = {
	percentage: number
	step_name: string
}
