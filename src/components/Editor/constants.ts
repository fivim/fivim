// Extention of image files.
export const IMAGE_EXT_ARR = ['bmp', 'jpg', 'jpeg', 'png', 'gif']
// Extention of source code files.
export const SOURCE_CODE_EXT_ARR = [
	'c',
	'c++',
	'cpp',
	'cs',
	'css',
	'cxx',
	'go',
	'h',
	'hpp',
	'htm',
	'html',
	'hxx',
	'java',
	'jl',
	'js',
	'json',
	'kt',
	'log',
	'php',
	'pl',
	'pm',
	'py',
	'r',
	'rs',
	'sql',
	'swift',
	'ts',
	'xml',
	//
	'txt',
]

// Extention of audio files.
export const AUDIO_EXT_ARR = ['aac', 'aif', 'aiff', 'ape', 'flac', 'mid', 'mp3', 'ogg', 'wav', 'wma']

// Show a red box and a cross for wrong images.
const svgString = `  
<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50">  
<rect width="50" height="50" style="fill:rgb(255,255,255);stroke-width:1;stroke:rgb(255,0,0)" />
  <text x="15" y="32" fill="black" font-size="20">❌</text>
</svg>  
`
const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
const dataUrl = URL.createObjectURL(blob)
export const WRONG_IMAGE_URL = dataUrl // Set it to img element's src attribute.
