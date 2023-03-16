import { open as openDialog } from '@tauri-apps/api/dialog';

import './index.scss';
import { attachmentPrefix } from '../../utils/conf';

import Uploader from './uploader';
import { make, moveCaretToTheEnd, isEmpty } from '../../utils/dom';
import { getExtensionFromFileName } from '../../utils/file';
import { IconChevronDown, IconFile } from '@codexteam/icons';

const LOADER_TIMEOUT = 500;

/**
 * @typedef {object} AttachesToolData
 * @description Attaches Tool's output data format
 * @property {AttachesFileData} file - object containing information about the file
 * @property {string} title - file's title
 */

/**
 * @typedef {object} AttachesFileData
 * @description Attaches Tool's file format
 * @property {string} [url] - file's upload url
 * @property {string} [size] - file's size
 * @property {string} [extension] - file's extension
 * @property {string} [name] - file's name
 */

/**
 * @typedef {object} FileData
 * @description Attaches Tool's response from backend. Could contain any data.
 * @property {string} [url] - file's url
 * @property {string} [name] - file's name with extension
 * @property {string} [extension] - file's extension
 */

/**
 * @typedef {object} UploadResponseFormat
 * @description This format expected from backend on file upload
 * @property {number} success  - 1 for successful uploading, 0 for failure
 * @property {FileData} file - backend response with uploaded file data.
 */

/**
 * @typedef {object} AttachesToolConfig
 * @description Config supported by Tool
 * @property {string} endpoint - file upload url
 * @property {string} field - field name for uploaded file
 * @property {string} types - available mime-types
 * @property {string} errorMessage - message to show if file uploading failed
 * @property {object} [uploader] - optional custom uploader
 * @property {function(File): Promise.<UploadResponseFormat>} [uploader.uploadByFile] - custom method that upload file and returns response
 */

/**
 * @typedef {object} EditorAPI
 * @property {object} styles - Styles API {@link https://github.com/codex-team/editor.js/blob/next/types/api/styles.d.ts}
 * @property {object} i18n - Internationalization API {@link https://github.com/codex-team/editor.js/blob/next/types/api/i18n.d.ts}
 * @property {object} notifier - Notifier API {@link https://github.com/codex-team/editor.js/blob/next/types/api/notifier.d.ts}
 */

/**
 * @class AttachesTool
 * @classdesc AttachesTool for Editor.js 2.0
 */
export default class AttachesTool {
  /**
   * @param {object} options - tool constructor options
   * @param {AttachesToolData} [options.data] - previously saved data
   * @param {AttachesToolConfig} options.config - user defined config
   * @param {EditorAPI} options.api - Editor.js API
   * @param {boolean} options.readOnly - flag indicates whether the Read-Only mode enabled or not
   */
  constructor({ data, config, api, readOnly }) {
    this.api = api;
    this.readOnly = readOnly;

    this.nodes = {
      wrapper: null,
      button: null,
      title: null,
    };

    this._data = {
      file: {},
      title: '',
    };

    this.config = {
      endpoint: config.endpoint || '',
      field: config.field || 'file',
      types: config.types || '*',
      buttonText: config.buttonText || 'Select file to upload',
      errorMessage: config.errorMessage || 'File upload failed',
      uploader: config.uploader || undefined,
      additionalRequestHeaders: config.additionalRequestHeaders || {},
    };

    if (data !== undefined && !isEmpty(data)) {
      this.data = data;
    }

    /**
     * Module for files uploading
     */
    this.uploader = new Uploader({
      config: this.config,
      onUpload: (response) => this.onUpload(response),
      onError: (error) => this.uploadingFailed(error),
    });

    this.enableFileUpload = this.enableFileUpload.bind(this);

    // Add a global function to window.
    // Select target dir and decrypt file content to it.
    window.XEditorAttachesDownEncryptedFile = (fileUrl) => {
      // TODO Allow user select preview(image / pdf .etc) or download
      // Open a selection dialog for output file
      openDialog({
        directory: true,
      }).then((selected) => {
        console.log(`>>> file: ${fileUrl}, selected dir: ${selected}`);

        // TODO use rust to read file, encrpyt/decrypt, output
      });
    };
  }

  /**
   * Get Tool toolbox settings
   * icon - Tool icon's SVG
   * title - title to show in toolbox
   *
   * @returns {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: IconFile,
      title: 'Attachment',
    };
  }

  /**
   * Returns true to notify core that read-only is supported
   *
   * @returns {boolean}
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * Tool's CSS classes
   *
   * @returns {object}
   */
  get CSS() {
    return {
      baseClass: this.api.styles.block,
      apiButton: this.api.styles.button,
      loader: this.api.styles.loader,
      /**
       * Tool's classes
       */
      wrapper: 'cdx-attaches',
      wrapperWithFile: 'cdx-attaches--with-file',
      wrapperLoading: 'cdx-attaches--loading',
      button: 'cdx-attaches__button',
      title: 'cdx-attaches__title',
      size: 'cdx-attaches__size',
      downloadButton: 'cdx-attaches__download-button',
      fileInfo: 'cdx-attaches__file-info',
      fileIcon: 'cdx-attaches__file-icon',
      fileIconBackground: 'cdx-attaches__file-icon-background',
      fileIconLabel: 'cdx-attaches__file-icon-label',
    };
  }

  /**
   * Possible files' extension colors
   *
   * @returns {object}
   */
  get EXTENSIONS() {
    return {
      // Compressed file
      '7z': '#4f566f',
      cab: '#4f566f',
      gz: '#4f566f',
      rar: '#4f566f',
      tar: '#4f566f',
      zip: '#4f566f',

      // Document
      // Table Document
      csv: '#11ae3d',
      ods: '#11ae3d', // LibreOffice Clac
      ots: '#11ae3d', // LibreOffice Clac
      xls: '#11ae3d',
      xlsx: '#11ae3d',
      // Text Document
      doc: '#1483e9',
      docx: '#1483e9',
      odt: '#1483e9', // LibreOffice witer
      ott: '#1483e9', // LibreOffice witer
      rtf: '#1483e9',
      tex: '#1483e9',
      txt: '#1483e9',
      // Other Document
      cmh: '#db2f2f',
      eml: '#db2f2',
      pdf: '#db2f2f',
      ppt: '#db2f2f',
      pptx: '#db2f2f',
      wps: '#db2f2f',

      // Image and design
      ai: '#fb601d',
      bmp: '#fb601d',
      cad: '#fb601d',
      cdr: '#fb601d',
      cdt: '#fb601d',
      cpr: '#fb601d',
      cpt: '#fb601d',
      gif: '#fb601d',
      jpeg: '#fb601d',
      jpg: '#fb601d',
      pic: '#fb601d',
      png: '#fb601d',
      psd: '#fb601d',
      sketch: '#fb601d',
      svg: '#fb601d',

      // Program develop
      asm: '#2988f0', // Assembly Language
      bash: '#2988f0',
      bat: '#2988f0',
      c: '#2988f0', // C
      cfg: '#2988f0',
      cmd: '#2988f0',
      cpp: '#2988f0', // C++
      cs: '#2988f0', // C#
      d: '#2988f0', // D
      dart: '#2988f0',
      erl: '#2988f0', // Erlang
      f: '#2988f0', // FORTRAN
      for: '#2988f0', // FORTRAN
      go: '#2988f0',
      h: '#2988f0', // C / C++ / Objective-C
      hrl: '#2988f0', // Erlang
      hs: '#2988f0', // Haskell
      htm: '#2988f0',
      html: '#2988f0',
      jar: '#2988f0', // java
      java: '#2988f0',
      jl: '#2988f0', // julia
      js: '#2988f0', // javascript
      json: '#2988f0',
      kt: '#2988f0', // kotlin
      lhs: '#2988f0', // Haskell
      lisp: '#2988f0',
      lsp: '#2988f0', // lisp
      lua: '#2988f0',
      m: '#2988f0', // MATLAB / Objective-C
      mat: '#2988f0', // MATLAB
      mlx: '#2988f0', // MATLAB
      mm: '#2988f0', // Objective-C
      mqh: '#2988f0', // mql
      mql: '#2988f0', // mql
      php: '#2988f0',
      pl: '#2988f0', // perl
      pm: '#2988f0', // perl
      py: '#2988f0', // python
      pyc: '#2988f0', // python
      r: '#2988f0', // R
      rb: '#2988f0', // ruby
      rda: '#2988f0', // R
      rdata: '#2988f0', // R
      rds: '#2988f0', // R
      rs: '#2988f0', // rust
      scala: '#2988f0',
      sh: '#2988f0', // bash
      sql: '#2988f0',
      swift: '#2988f0',
      vb: '#2988f0', // Visual Basic
      war: '#2988f0', // java

      // Program file
      bin: '#e26f6f',
      com: '#e26f6f',
      dmg: '#e26f6f',
      dll: '#e26f6f',
      exe: '#e26f6f',
      msi: '#e26f6f',
      so: '#e26f6f',

      // Sound
      aac: '#eab456',
      aif: '#eab456',
      aifc: '#eab456',
      aiff: '#eab456',
      amr: '#eab456',
      au: '#eab456',
      cda: '#eab456',
      flac: '#eab456',
      m4a: '#eab456',
      mp3: '#eab456',
      ram: '#eab456',
      wav: '#eab456',
      wma: '#eab456',

      // video
      avi: '#813c85',
      flv: '#813c85',
      mov: '#813c85',
      mp4: '#813c85',
      mpeg: '#813c85',
      mpp: '#813c85',
      rm: '#813c85',
      rmvb: '#813c85',
      swf: '#813c85',
    };
  }

  /**
   * Validate block data:
   * - check for emptiness
   *
   * @param {AttachesToolData} savedData — data received after saving
   * @returns {boolean} false if saved data is not correct, otherwise true
   * @public
   */
  validate(savedData) {
    if (isEmpty(savedData.file)) {
      return false;
    }

    return true;
  }

  /**
   * Return Block data
   *
   * @param {HTMLElement} toolsContent - block main element returned by the render method
   * @returns {AttachesToolData}
   */
  save(toolsContent) {
    /**
     * If file was uploaded
     */
    if (this.pluginHasData()) {
      const titleElement = toolsContent.querySelector(`.${this.CSS.title}`);

      if (titleElement) {
        Object.assign(this.data, {
          title: titleElement.innerHTML,
        });
      }
    }

    return this.data;
  }

  /**
   * Renders Block content
   *
   * @returns {HTMLDivElement}
   */
  render() {
    const holder = make('div', this.CSS.baseClass);

    this.nodes.wrapper = make('div', this.CSS.wrapper);

    if (this.pluginHasData()) {
      this.showFileData();
    } else {
      this.prepareUploadButton();
    }

    holder.appendChild(this.nodes.wrapper);

    return holder;
  }

  /**
   * Prepares button for file uploading
   */
  prepareUploadButton() {
    this.nodes.button = make('div', [this.CSS.apiButton, this.CSS.button]);
    this.nodes.button.innerHTML = `${IconFile} ${this.config.buttonText}`;

    if (!this.readOnly) {
      this.nodes.button.addEventListener('click', this.enableFileUpload);
    }

    this.nodes.wrapper.appendChild(this.nodes.button);
  }

  /**
   * Fires after clicks on the Toolbox AttachesTool Icon
   * Initiates click on the Select File button
   *
   * @public
   */
  appendCallback() {
    this.nodes.button.click();
  }

  /**
   * Checks if any of Tool's fields have data
   *
   * @returns {boolean}
   */
  pluginHasData() {
    return this.data.title !== '' || Object.values(this.data.file).some(item => item !== undefined);
  }

  /**
   * Allow to upload files on button click
   */
  enableFileUpload() {
    this.uploader.uploadSelectedFile({
      onPreview: () => {
        this.nodes.wrapper.classList.add(this.CSS.wrapperLoading, this.CSS.loader);
      },
    });
  }

  /**
   * File uploading callback
   *
   * @param {UploadResponseFormat} response - server returned data
   */
  onUpload(response) {
    const body = response;

    try {
      if (body.success && body.file !== undefined && !isEmpty(body.file)) {
        this.data = {
          file: body.file,
          title: body.file.title || '',
        };

        this.nodes.button.remove();
        this.showFileData();

        moveCaretToTheEnd(this.nodes.title);

        this.removeLoader();
      } else {
        this.uploadingFailed(this.config.errorMessage);
      }
    } catch (error) {
      console.error('Attaches tool error:', error);
      this.uploadingFailed(this.config.errorMessage);
    }

    /**
     * Trigger onChange function when upload finished
     */
    this.api.blocks.getBlockByIndex(this.api.blocks.getCurrentBlockIndex()).dispatchChange();
  }

  /**
   * Handles uploaded file's extension and appends corresponding icon
   *
   * @param {Object<string, string | number | boolean>} file - uploaded file data got from the backend. Could contain any fields.
   */
  appendFileIcon(file) {
    const extensionProvided = file.extension;
    const extension = extensionProvided || getExtensionFromFileName(file.name);
    const extensionColor = this.EXTENSIONS[extension];
    const extensionMaxLen = 4;

    const wrapper = make('div', this.CSS.fileIcon);
    const background = make('div', this.CSS.fileIconBackground);

    if (extensionColor) {
      background.style.backgroundColor = extensionColor;
    }

    wrapper.appendChild(background);

    /**
     * If extension exists, add it via a separate element
     * Otherwise, append file icon
     */
    if (extension) {
      /**
       * Trim long extensions
       *  'sketch' -> 'sket…'
       */
      let extensionVisible = extension;

      if (extension.length > extensionMaxLen) {
        extensionVisible = extension.substring(0, extensionMaxLen) + '…';
      }

      const extensionLabel = make('div', this.CSS.fileIconLabel, {
        textContent: extensionVisible, // trimmed
        title: extension, // full text for hover
      });

      if (extensionColor) {
        extensionLabel.style.backgroundColor = extensionColor;
      }

      wrapper.appendChild(extensionLabel);
    } else {
      background.innerHTML = IconFile;
    }

    this.nodes.wrapper.appendChild(wrapper);
  }

  /**
   * Removes tool's loader
   */
  removeLoader() {
    setTimeout(() => this.nodes.wrapper.classList.remove(this.CSS.wrapperLoading, this.CSS.loader), LOADER_TIMEOUT);
  }

  /**
   * If upload is successful, show info about the file
   */
  showFileData() {
    this.nodes.wrapper.classList.add(this.CSS.wrapperWithFile);

    const { file, title } = this.data;

    this.appendFileIcon(file);

    const fileInfo = make('div', this.CSS.fileInfo);

    this.nodes.title = make('div', this.CSS.title, {
      contentEditable: this.readOnly === false,
    });

    this.nodes.title.dataset.placeholder = this.api.i18n.t('File title');
    this.nodes.title.textContent = title || '';
    fileInfo.appendChild(this.nodes.title);

    if (file.size) {
      let sizePrefix;
      let formattedSize;
      const fileSize = make('div', this.CSS.size);

      if (Math.log10(+file.size) >= 6) {
        sizePrefix = 'MiB';
        formattedSize = file.size / Math.pow(2, 20);
      } else {
        sizePrefix = 'KiB';
        formattedSize = file.size / Math.pow(2, 10);
      }

      fileSize.textContent = formattedSize.toFixed(1);
      fileSize.setAttribute('data-size', sizePrefix);
      fileInfo.appendChild(fileSize);
    }

    this.nodes.wrapper.appendChild(fileInfo);

    if (file.url !== undefined) {
      let attributes = { };

      if (file.url.startsWith(attachmentPrefix)) { // Encrypted attaches
        attributes = {
          innerHTML: IconChevronDown,
          href: `javascript:XEditorAttachesDownEncryptedFile("${file.url}");`,
        };
      } else { // Normal attaches
        attributes = {
          innerHTML: IconChevronDown,
          href: file.url,
          target: '_blank',
          rel: 'nofollow noindex noreferrer',
        };
      }
      const downloadIcon = make('a', this.CSS.downloadButton, attributes);

      this.nodes.wrapper.appendChild(downloadIcon);
    }
  }

  /**
   * If file uploading failed, remove loader and show notification
   *
   * @param {string} errorMessage -  error message
   */
  uploadingFailed(errorMessage) {
    this.api.notifier.show({
      message: errorMessage,
      style: 'error',
    });

    this.removeLoader();
  }

  /**
   * Return Attaches Tool's data
   *
   * @returns {AttachesToolData}
   */
  get data() {
    return this._data;
  }

  /**
   * Stores all Tool's data
   *
   * @param {AttachesToolData} data - data to set
   */
  set data({ file, title }) {
    this._data = {
      file,
      title,
    };
  }
}
