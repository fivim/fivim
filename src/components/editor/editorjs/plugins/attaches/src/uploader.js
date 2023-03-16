import { open as openDialog } from '@tauri-apps/api/dialog';
import { getHasdedSign } from '@/utils/pinia_data_related';

import ajax from '@codexteam/ajax';

import { attachmentPrefix } from '../../utils/conf';

/**
 * @typedef AttachesToolConfig
 */

/**
 * Module for file uploading.
 */
export default class Uploader {
  /**
   * @param {object} options - constructor params
   * @param {AttachesToolConfig} options.config - user defined configuration
   * @param {Function} options.onUpload - callback for successful file upload
   * @param {Function} options.onError - callback for uploading errors
   */
  constructor({ config, onUpload, onError }) {
    this.config = config;
    this.onUpload = onUpload;
    this.onError = onError;
  }

  /**
   * Handle clicks on the upload file button
   *
   * @param {Function} onPreview - callback fired when preview is ready
   */
  uploadSelectedFile({ onPreview }) {
    /**
     * Custom uploading
     * or default uploading
     */
    let upload;

    // custom uploading
    if (this.config.uploader && typeof this.config.uploader.uploadByFile === 'function') {
      upload = ajax.selectFiles({ accept: this.config.types }).then((files) => {
        onPreview();
        const customUpload = this.config.uploader.uploadByFile(files[0]);

        if (!isPromise(customUpload)) {
          console.warn('Custom uploader method uploadByFile should return a Promise');
        }

        return customUpload;
      });

      // default uploading
    } else {
      // Open a file selection dialog, get file path use rust, and then encrypt the file.
      // Refer: https://tauri.app/v1/api/js/dialog#open
      upload = openDialog({
        multiple: false,
      }).then((selected) => {
        let splitArr = [];

        if (navigator.appVersion.indexOf('Win') != -1) {
          splitArr = selected.split('\\');
        } else {
          splitArr = selected.split('/');
        }

        // TODO use rust read and encrypt

        return new Promise((resolve, reject) => {
          resolve({
            success: 1,
            file: {
              title: splitArr.slice(-1),
              url: attachmentPrefix + getHasdedSign(),
            },
          });
        });
      });
    }

    upload.then((response) => {
      console.log(`>>>>>>>>>>>>>>>>>>>> response:`, response); // TODO

      this.onUpload(response);
    }).catch((errorResponse) => {
      const error = errorResponse.body;
      const message = (error && error.message) ? error.message : this.config.errorMessage;

      this.onError(message);
    });
  }
}
