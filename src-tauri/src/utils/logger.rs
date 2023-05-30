
use std::path::{Path,PathBuf};

use crate::conf;
use crate::utils;
use xutils::dir::check_or_create;

pub fn gen_logger_file_path() -> PathBuf {
    let binding = utils::tauri::home_app_dir();
    let home_app_dir = binding.as_str();
    let file_name = format!("{}{}", utils::tauri::app_name(), conf::LOG_FILE_EXT);
    let file_path = Path::new(&home_app_dir).join(&file_name);

    check_or_create(&home_app_dir);
    return file_path;
}
