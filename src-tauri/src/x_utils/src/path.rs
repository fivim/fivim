use std::path::PathBuf;

use crate::logger as x_logger;
use crate::errors::EaError as x_error;

pub fn path_buf_to_string(path_buf: PathBuf) -> String {
    return path_buf.into_os_string().into_string().unwrap();
}

pub fn get_parent_dir_path(path_str: &str) -> String {
    let dir = std::path::Path::new(&path_str);

    match dir.parent() {
        Some(parent_dir) => {
            return parent_dir
                .as_os_str()
                .to_os_string()
                .to_str()
                .unwrap()
                .to_string();
        }
        None => {
            let eee = x_error::ParentDirNotFoundError {
                path: path_str.to_owned(),
            };
            x_logger::log_error(&format!("get_parent_dir_path:: {}\n", eee));

            return "".to_string();
        }
    }
}
