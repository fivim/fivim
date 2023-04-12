use std::io;

use anyhow;
use base64;
use custom_error::custom_error;
use fs_extra;

custom_error! {pub EaError
    // dir
    DirReadError{path:String, error: io::Error} = "Dir read error: >>>{error}<<<, path: >>>{path}<<<",
    DirGetSizeError{path:String, error: fs_extra::error::Error} = "Dir get_size error: >>>{error}<<<, path: >>>{path}<<<",

    // file
    FileCopyError{source_path:String, dist_path:String, error: io::Error} = "File copy error: >>>{error}<<<, source_path: >>>{source_path}<<<, dist_path: >>>{dist_path}<<<",
    FileCreateError{path:String, error: io::Error} = "File create error: >>>{error}<<<, path: >>>{path}<<<",
    FileGetSizeError{path:String, error: io::Error} = "File get_size error: >>>{error}<<<, path: >>>{path}<<<",
    FileOpenError{path:String, error: io::Error} = "File open error: >>>{error}<<<, path: >>>{path}<<<",
    FileReadError{path:String, error: io::Error} = "File read error: >>>{error}<<<, path: >>>{path}<<<",
    FileReadSeekError{path:String, error: io::Error} = "File read seek error: >>>{error}<<<, path: >>>{path}<<<",
    FileRemoveError{path:String, error: io::Error} = "File remove error: >>>{error}<<<, path: >>>{path}<<<",
    FileRenameError{path:String, error: io::Error} = "File rename error: >>>{error}<<<, path: >>>{path}<<<",
    FileWriteError{path:String, error: io::Error} = "File write error: >>>{error}<<<, path: >>>{path}<<<",

    // base64
    Base64DecodeError{error:base64::DecodeError } = "Base64 decode error >>>{error}<<<",

    // encrypt
    EncryptFileError{path:String, error: anyhow::Error} = "Encrypt error: >>>{error}<<<, path: >>>{path}<<<",
    DecryptFileError{path:String, error: anyhow::Error} = "Decrypt error: >>>{error}<<<, path: >>>{path}<<<",
    EncryptBytesError{bytes:String, error: anyhow::Error} = "Encrypt error: >>>{error}<<<, path: >>>{bytes}<<<",
    DecryptBytesError{bytes:String, error: anyhow::Error} = "Decrypt error: >>>{error}<<<, path: >>>{bytes}<<<",
    ReEncryptFileError{source_path:String, dist_path:String, error: anyhow::Error} = "Re-encrypt error: >>>{error}<<<, source_path: >>>{source_path}<<<, dist_path:>>>{dist_path}<<<",

    // path
    ParentDirNotFoundError{path:String} = "Parent dir not found, path: >>>{path}<<<",
    ReNameError{old_path:String, new_path:String, error: io::Error} = "Rename error: >>>{error}<<<, old_path: >>>{new_path}<<<, dist_path:>>>{new_path}<<<",
}
