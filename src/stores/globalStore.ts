import { TreeDataNode } from 'antd'
import { action, makeAutoObservable, observable } from 'mobx'

import { AlertDialogProps, AlertDialogRes } from '@/components/AlertDialog'
import { OutlineHeading } from '@/components/Editor/RichText/types'
import { MessageLineProps } from '@/components/MessageLine'
import { EditorType, Global } from '@/types'
import { tmplGlobal } from '@/types_template'

class GlobalStore {
	data: Global

	constructor() {
		this.data = tmplGlobal()
		makeAutoObservable(
			this,
			{
				data: observable,
				setAppIsLoading: action,
				setCurrentFileName: action,
				setCurrentFilePath: action,
				setData: action,
				setEditorType: action,
				setExistConfigFile: action,
				setFileTreeData: action,
				setGlobalMessageLineProps: action,
				setGlobalWebAlertDialogProps: action,
				setGlobalWebAlertDialogRes: action,
				setIsMobile: action,
				setIsMobileScreen: action,
				setIsPc: action,
				setIsPcScreen: action,
				setLockscreen: action,
				setOpenMenuOpt: action,
				setOpenMenuTree: action,
				setOutlineHeadings: action,
				setPathOfConfDir: action,
				setPathOfHome: action,
				setPathOfLogFile: action,
				setPathOfUserFilesDefult: action,
				setPathSeparator: action,				
				setRunInTauri: action,
				setTitlebarShowLockIcon: action,
				setTitlebarText: action,
			},
			{ autoBind: true },
		)
	}

	getData() {
		return this.data
	}

	setData(value: Global) {
		this.data = value
	}

	setAppIsLoading(val: boolean) {
		this.data.appIsLoading = val
	}
	setCurrentFileName(val: string) {
		this.data.currentFileName = val
	}
	setCurrentFilePath(val: string) {
		this.data.currentFilePath = val
	}
	setEditorType(val: EditorType) {
		this.data.editorType = val
	}
	setExistConfigFile(val: boolean) {
		this.data.existConfigFile = val
	}
	setFileTreeData(val: TreeDataNode[]) {
		this.data.fileTreeData = val
	}
	setGlobalMessageLineProps(val: MessageLineProps) {
		this.data.globalMessageLineProps = val
	}
	setGlobalWebAlertDialogProps(val: AlertDialogProps) {
		this.data.globalWebAlertDialogProps = val
	}
	setGlobalWebAlertDialogRes(val: AlertDialogRes) {
		this.data.globalWebAlertDialogRes = val
	}
	setIsMobile(val: boolean) {
		this.data.isMobileOs = val
	}
	setIsMobileScreen(val: boolean) {
		this.data.isMobileScreen = val
	}
	setIsPc(val: boolean) {
		this.data.isPcOs = val
	}
	setIsPcScreen(val: boolean) {
		this.data.isPcScreen = val
	}
	setLockscreen(val: boolean) {
		this.data.lockscreen = val
	}
	setOpenMenuOpt(val: boolean) {
		this.data.openMenuOpt = val
	}
	setOpenMenuTree(val: boolean) {
		this.data.openMenuTree = val
	}
	setOutlineHeadings(val: OutlineHeading[]) {
		this.data.outlineHeadings = val
	}
	setPathOfConfDir(val: string) {
		this.data.pathOfConfDir = val
	}
	setPathOfHome(val: string) {
		this.data.pathOfHome = val
	}
	setPathOfLogFile(val: string) {
		this.data.pathOfLogFile = val
	}
	setPathOfUserFilesDefult(val: string) {
		this.data.pathOfUserFilesDefult = val
	}
	setPathSeparator(val: string) {
		this.data.pathSeparator = val
	}	
	setRunInTauri(val: boolean) {
		this.data.runInTauri = val
	}
	setTitlebarShowLockIcon(val: boolean) {
		this.data.titlebarShowLockIcon = val
	}
	setTitlebarText(val: string) {
		this.data.titlebarText = val
	}
}
export default new GlobalStore()
