import cpt from 'crypto-js'

import { PASSWORD_SALT } from '@/constants'

export const md5 = (message: string) => cpt.MD5(message).toString()

export const sha256 = (message: string) => cpt.SHA256(message).toString()

export const genMasterPasswordSha256 = (password: string) => {
	return sha256(password + PASSWORD_SALT)
}
