// Refer https://github.com/samholmes/node-open-graph/blob/master/index.js

import { load as loadHtml } from 'cheerio'
import { invoker } from '@/libs/commands/invoke'

const shorthandProperties = {
  image: 'image:url',
  video: 'video:url',
  audio: 'audio:url'
}

const keyBlacklist = [
  '__proto__',
  'constructor',
  'prototype'
]

export const parse = ($, options) => {
  options = options || {}

  if (typeof $ === 'string') { $ = loadHtml($) }

  // Check for xml namespace
  let namespace
  const $html = $('html')

  if ($html.length) {
    const attribKeys = Object.keys($html[0].attribs)

    attribKeys.some(function (attrName) {
      const attrValue = $html.attr(attrName)

      if (attrValue.toLowerCase() === 'http://opengraphprotocol.org/schema/' &&
        attrName.substring(0, 6) === 'xmlns:') {
        namespace = attrName.substring(6)
        return false
      }
      return true
    })
  } else if (options.strict) { return null }

  if (!namespace) {
    // If no namespace is explicitly set..
    if (options.strict) {
      // and strict mode is specified, abort parse.
      return null
    } else { // and strict mode is not specific, then default to "og"
      namespace = 'og'
    }
  }

  const meta = {}
  const metaTags = $('meta')

  metaTags.each(function () {
    const element = $(this)
    const propertyAttr = element.attr('property')

    // If meta element isn't an "og:" property, skip it
    if (!propertyAttr || propertyAttr.substring(0, namespace.length) !== namespace) { return }

    let property = propertyAttr.substring(namespace.length + 1)
    const content = element.attr('content')

    // If property is a shorthand for a longer property,
    // Use the full property
    property = shorthandProperties[property] || property

    let key; let tmp
    let ptr = meta
    const keys = property.split(':', 4)

    // we want to leave one key to assign to so we always use references
    // as long as there's one key left, we're dealing with a sub-node and not a value

    while (keys.length > 1) {
      key = keys.shift()

      if (keyBlacklist.includes(key)) continue

      if (Array.isArray(ptr[key])) {
        // the last index of ptr[key] should become
        // the object we are examining.
        tmp = ptr[key].length - 1
        ptr = ptr[key]
        key = tmp
      }

      if (typeof ptr[key] === 'string') {
        // if it's a string, convert it
        ptr[key] = { '': ptr[key] }
      } else if (ptr[key] === undefined) {
        // create a new key
        ptr[key] = {}
      }

      // move our pointer to the next subnode
      ptr = ptr[key]
    }

    // deal with the last key
    key = keys.shift()

    if (ptr[key] === undefined) {
      ptr[key] = content
    } else if (Array.isArray(ptr[key])) {
      ptr[key].push(content)
    } else {
      ptr[key] = [ptr[key], content]
    }
  })

  // If no 'og:title', use title tag
  if (!Object.prototype.hasOwnProperty.call(meta, 'title')) {
    meta.title = $('title').text()
  }

  // Temporary fallback for image meta.
  // Fallback to the first image on the page.
  // In the future, the image property could be populated
  // with an array of images, maybe.
  if (!Object.prototype.hasOwnProperty.call(meta, 'image')) {
    const imgs = $('img')
    if (imgs.length > 0) {
      const firstImageAttribs = imgs[0].attribs

      meta.image = {
        url: firstImageAttribs.src,
        width: firstImageAttribs.width,
        height: firstImageAttribs.height
      }
    }
  }

  // Fallback for image meta, Use site favicon.
  if (!Object.prototype.hasOwnProperty.call(meta, 'image')) {
    const links = $('link')

    links.each(function () {
      const element = $(this)[0]
      const rels = element.attribs.rel.split(' ')
      if (rels.indexOf('icon') > -1) {
        // TODO Support relative paths
        meta.image = {
          url: element.attribs.href,
          width: '32px',
          height: '32px'
        }
      }
    })
  }

  return meta
}

export const og = async (url) => {
  const response = await invoker.httpRequestText('GET', url)
  try {
    const parsedMeta = parse(response.data, {})
    return parsedMeta
  } catch (parseErr) {
    console.log('>>> parseErr:: ', parseErr)
  }
  return null
}
