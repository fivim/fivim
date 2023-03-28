export const getTimestampMilliseconds = () => {
  return new Date().getTime()
}

export const getDateByTmStr = (tmStr: string) => {
  return new Date(tmStr)
}
