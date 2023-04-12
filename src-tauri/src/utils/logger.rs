
use std::path::{Path,PathBuf};

use crate::conf;
use crate::utils;

pub fn gen_logger_file_path() -> PathBuf {
    let binding = utils::tauri::home_app_dir();
    let home_dir = binding.as_str();
    let file_name = format!("{}{}", utils::tauri::app_name(), conf::LOG_FILE_EXT);
    let file_path = Path::new(home_dir).join(file_name);
    return file_path;
}
