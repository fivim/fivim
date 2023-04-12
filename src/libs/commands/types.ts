import { TypeString, TypeBase64, TypeBinary, TypeNone } from '@/constants'

export interface Commands {
    notification(title: string, body: string, icon: string): Promise<void>;
    getPlatformName(): Promise<string>;
    getAppVersion(): Promise<string>;
    getAppName(): Promise<string>;
    isAndroid(): Promise<boolean>;
    isIos(): Promise<boolean>;
    isMacOs(): Promise<boolean>;
    isUnixLike(): Promise<boolean>;
    isWindows(): Promise<boolean>;
}

export type WriteFileRes = {
    success: boolean,
    errMsg: number
}

export type UserDataFile = {
    crc32: number,
    crc32_check: number,
    file_modify_timestamp: number,
    file_name: string,
    file_data: Uint8Array,
    file_data_str: string,
}

export type UserDataParseAs = typeof TypeString | typeof TypeBase64 | typeof TypeBinary | typeof TypeNone

export type FileMeta = {
    sha256: string,
    size: number,
}

export type ProgressStatus = {
    percentage: number,
    step_name: string,
}
