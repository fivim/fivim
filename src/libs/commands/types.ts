import { InvokeArgs } from '@tauri-apps/api/tauri'

export interface Commands {
    invoke(name: string, args: InvokeArgs): unknown;
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
    file_modify_timestamp: number,
    file_name: string,
    file_data: Uint8Array,
    file_data_str: string,
}

export type LogLevel = 'ERROR' | 'INFO' | 'DEBUG'
