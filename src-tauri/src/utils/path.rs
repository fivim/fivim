use std::path::PathBuf;

use crate::utils::logger as x_logger;

pub fn path_buf_to_string(path_buf: PathBuf) -> String {
    return path_buf.into_os_string().into_string().unwrap();
}

pub fn get_parent_dir_in_path_string(path_str: &str) -> String {
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
            x_logger::log_error(&format!(
                ">>> get_parent_dir_in_path_string parent is none, path: {}\n",
                path_str
            ));
            return "".to_string();
        }
    }
}
