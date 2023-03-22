/**
 * Return an extension by passed file name
 *
 * @param {string|undefined} name  - file name to process
 * @returns {string}
 */
export function getExtensionFromFileName(name) {
  if (name === undefined) {
    return ''
  }

  return name.split('.').pop()
}
