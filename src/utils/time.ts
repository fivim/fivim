import { DateTime } from 'luxon'

export const getTimestampMilliseconds = () => {
	return new Date().getTime()
}

export const getDateByTmStr = (tmStr: string) => {
	return new Date(tmStr)
}

// Convert ISO 8601 string(like: `2017-04-20T11:32:00.000+08:00`) to datetime.
export const iso8601StrToDateTime = (sss: string) => {
	if (!sss) {
		return DateTime.fromMillis(0)
	}

	return DateTime.fromISO(sss, {
		setZone: true,
	})
}

export const convertFileIndexTime = (sss: string) => {
	return iso8601StrToDateTime(sss).toFormat('yyyy-LL-dd HH:mm:ss')
}
