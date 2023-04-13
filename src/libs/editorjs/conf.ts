import { EditorConfig } from '@editorjs/editorjs'

import ChecklistTool from '@editorjs/checklist'
import CodeTool from '@editorjs/code'
import DelimiterTool from '@editorjs/delimiter'
import EmbedTool from '@editorjs/embed'
import HeaderTool from '@editorjs/header'
import InlineCodeTool from '@editorjs/inline-code'
import ListTool from '@editorjs/list'
import MarkerTool from '@editorjs/marker'
import QuoteTool from '@editorjs/quote'
import TableTool from '@editorjs/table'

// import AttachesTool from './plugins/attaches/src/index.js'
import ImageTool from './plugins/image/src/index.js'
import LinkTool from './plugins/link/src/index.js'

import { Props } from './types'
import { i18n } from '@/libs/init/i18n'

// Insert plugin
export const mergeConfig = (confInput: Props) => {
  const t = i18n.global.t

  const confAdd: EditorConfig = {
    data: confInput.contentData,
    placeholder: confInput.contentPlaceholder || '',

    // logLevel: 'ERROR', // avoid type error
    // autofocus: true,
    hideToolbar: false,
    tools: {
      /* TODO
      attaches: {
        class: AttachesTool as unknown as undefined, // avoid type error
        config: {
          buttonText: t('NoteEditor.Select file to upload'),
          errorMessage: t('NoteEditor.File upload failed')
        }
      },
      */
      checklist: ChecklistTool,
      code: CodeTool,
      delimiter: DelimiterTool,
      embed: {
        class: EmbedTool as unknown as undefined, // avoid type error
        inlineToolbar: true,
        config: {
          services: {
            youtube: true,
            coub: true
          }
        }
      },
      header: { // Refer: https://github.com/editor-js/header
        class: HeaderTool as unknown as undefined, // avoid type error
        // inlineToolbar: ['marker', 'link'],
        config: {
          placeholder: t('Header'),
          levels: [1, 2, 3, 4, 5, 6]
        }
        // shortcut: 'CMD+SHIFT+H'
      },
      image: { // Refer: https://github.com/editor-js/image
        class: ImageTool as unknown as undefined, // avoid type error
        config: {
          // ---------- Custom uploader ----------
          // Refer: https://github.com/editor-js/image section <Providing custom uploading methods>
          uploader: {
            /**
             * Upload file to the server and return an uploaded image data
             * Refer: https://gist.github.com/marco-souza/552f94f87059fdeeef35e95d1680de84
             * @param {File} file - file selected from the device or pasted by drag-n-drop
             * @return {Promise.<{success, file: {url}}>}
             */
            uploadByFile: (file: File) => new Promise((resolve, reject) => {
              const reader = new FileReader()
              reader.readAsDataURL(file)
              reader.onload = () => {
                const base64 = reader.result

                resolve({
                  success: 1,
                  file: {
                    url: base64
                    // any other image data you want to store, such as width, height, color, extension, etc
                  }
                })
              }
              reader.onerror = (error) => reject(error)
            }),

            /**
             * Send URL-string to the server. Backend should load image by this URL and return an uploaded image data
             * Refer: https://stackoverflow.com/questions/44070437/how-to-get-a-file-or-blob-from-an-url-in-javascript
             * @param {string} url - pasted image URL
             * @return {Promise.<{success, file: {url}}>}
             */
            uploadByUrl: (url: string) => new Promise((resolve, reject) => {
              fetch(url).then(res => res.blob()) // Gets the response and returns it as a blob
                .then(blob => {
                  const reader = new FileReader()
                  reader.readAsDataURL(blob)
                  reader.onload = () => {
                    const base64 = reader.result

                    resolve({
                      success: 1,
                      file: {
                        url: base64 || ''
                        // any other image data you want to store, such as width, height, color, extension, etc
                      }
                    })
                  }
                  reader.onerror = (error) => reject(error)
                })
            })
          }
          // ---------- Custom uploader end ----------
        }
      },
      inlineCode: InlineCodeTool,
      link: LinkTool,
      list: { // Refer: https://github.com/editor-js/list
        class: ListTool as unknown as undefined, // avoid type error
        inlineToolbar: true
      },
      marker: MarkerTool,
      quote: {
        class: QuoteTool as unknown as undefined, // avoid type error
        config: {
          quotePlaceholder: t('NoteEditor.Enter a quote'),
          captionPlaceholder: t('NoteEditor.Enter a caption')
        }
      },
      table: TableTool
    },
    // Internationalzation, refer https://editorjs.io/i18n/
    i18n: {
      /**
       * @type {I18nDictionary}
       */
      messages: {
        /**
         * Other below: translation of different UI components of the editor.js core
         */
        ui: {
          blockTunes: {
            toggler: {
              'Click to tune': t('NoteEditor.Click to tune'),
              'or drag to move': t('NoteEditor.or drag to move')
            }
          },
          inlineToolbar: {
            converter: {
              'Convert to': t('NoteEditor.Convert to')
            }
          },
          toolbar: {
            toolbox: {
              Add: t('NoteEditor.Add')
            }
          },
          popover: {
            Filter: t('NoteEditor.Filter'),
            'Nothing found': t('NoteEditor.Nothing found')
          }
        },

        /**
         * Section for translation Tool Names: both block and inline tools
         */
        toolNames: {
          Attachment: t('NoteEditor.Attachment'),
          Bold: t('NoteEditor.Bold'),
          Checklist: t('NoteEditor.Checklist'),
          Code: t('NoteEditor.Code'),
          Delimiter: t('NoteEditor.Delimiter'),
          Heading: t('NoteEditor.Heading'),
          Image: t('NoteEditor.Image'),
          InlineCode: t('NoteEditor.InlineCode'),
          Italic: t('NoteEditor.Italic'),
          Link: t('NoteEditor.Link'),
          List: t('NoteEditor.List'),
          Marker: t('NoteEditor.Marker'),
          Quote: t('NoteEditor.Quote'),
          'Raw HTML': t('NoteEditor.Raw HTML'),
          Table: t('NoteEditor.Table'),
          Text: t('NoteEditor.Text'),
          Warning: t('NoteEditor.Warning')
        },

        /**
         * Section for passing translations to the external tools classes
         */
        tools: {
          /**
           * Each subsection is the i18n dictionary that will be passed to the corresponded plugin
           * The name of a plugin should be equal the name you specify in the 'tool' section for that plugin
           */

          attaches: {
            'File title': t('NoteEditor.File title')
          },
          code: {
            'Enter a code': t('NoteEditor.Enter a code')
          },
          header: {
            Header: t('NoteEditor.Header'),
            'Heading 1': t('NoteEditor.Heading 1'),
            'Heading 2': t('NoteEditor.Heading 2'),
            'Heading 3': t('NoteEditor.Heading 3'),
            'Heading 4': t('NoteEditor.Heading 4'),
            'Heading 5': t('NoteEditor.Heading 5'),
            'Heading 6': t('NoteEditor.Heading 6')
          },
          image: {
            Caption: t('NoteEditor.Caption'),
            'Couldn’t upload image. Please try another.': t('Couldn’t upload image. Please try another.'),
            'Select an Image': t('NoteEditor.Select an Image'),
            // in tune
            'With border': t('NoteEditor.With border'),
            'Stretch image': t('NoteEditor.Stretch image'),
            'With background': t('NoteEditor.With background')
          },
          link: {
            'Add a link': t('NoteEditor.Add a link'),
            Link: t('NoteEditor.Link')
          },
          list: {
            // in tune
            Ordered: t('NoteEditor.Ordered'),
            Unordered: t('NoteEditor.Unordered')
          },
          quote: {
            'Align Left': t('NoteEditor.Align Left'),
            'Align Center': t('NoteEditor.Align Center')
          },
          stub: {
            'The block can not be displayed correctly.': t('NoteEditor.The block can not be displayed correctly.')
          },
          table: {
            'Add column to left': t('NoteEditor.Add column to left'),
            'Add column to right': t('NoteEditor.Add column to right'),
            'Add row above': t('NoteEditor.Add row above'),
            'Add row below': t('NoteEditor.Add row below'),
            'Delete column': t('NoteEditor.Delete column'),
            'Delete row': t('NoteEditor.Delete row'),
            Heading: t('NoteEditor.Heading'),
            'With headings': t('NoteEditor.With headings'),
            'Without headings': t('NoteEditor.Without headings')
          }
        },

        /**
         * Section allows to translate Block Tunes
         */
        blockTunes: {
          /**
           * Each subsection is the i18n dictionary that will be passed to the corresponded Block Tune plugin
           * The name of a plugin should be equal the name you specify in the 'tunes' section for that plugin
           *
           * Also, there are few internal block tunes: "delete", "moveUp" and "moveDown"
           */
          delete: {
            Delete: t('NoteEditor.Delete'),
            'Click to delete': t('NoteEditor.Click to delete')
          },
          moveUp: {
            'Move up': t('NoteEditor.Move up')
          },
          moveDown: {
            'Move down': t('NoteEditor.Move down')
          }
        }
      }
    }
  }

  return confAdd
}
