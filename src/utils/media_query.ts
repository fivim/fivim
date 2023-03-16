// Refer: https://tailwindcss.com/docs/responsive-design
export const MediaQueryBreakpoints = {
  sm: '(max-width: 767px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width:  1536px)',
  pointerFine: '(pointer: fine)'
}

export const MutuallyExclusiveMediaQueryBreakpoints = {
  sm: '(min-width: 0px) and (max-width: 767px)',
  md: '(min-width: 768px) and (max-width: 1023px)',
  lg: '(min-width: 1024px) and (max-width: 1279px)',
  xl: '(min-width: 1280px) and (max-width: 1536px)',
  '2xl': '(min-width:  1536px)',
  pointerFine: '(pointer: fine)'
}

export const OsThemeIsDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

export const isMobileScreen = () => window.matchMedia(MutuallyExclusiveMediaQueryBreakpoints.sm).matches

export const isTabletScreen = () => window.matchMedia(MutuallyExclusiveMediaQueryBreakpoints.md).matches

export const isTabletOrMobileScreen = () => isMobileScreen() || isTabletScreen()

export const getPageWidth = () => document.documentElement.clientWidth || document.body.offsetWidth

export const getPageHeight = () => document.documentElement.clientHeight || document.body.offsetHeight
