extern crate dirs;

use std::env;
use std::path::Path;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::utils::assets::EmbeddedAssets;

use crate::conf;

#[derive(Serialize, Deserialize, Debug)]
pub struct AppCoreConf {
    // #[serde(rename = "appName")]
    // app_name: String,
    #[serde(rename = "homeDir")]
    home_dir: String,
    #[serde(rename = "userFilesDirDefult")]
    user_files_dir_default: String,
    #[serde(rename = "logFilePath")]
    log_file_path: String,
    #[serde(rename = "pathSeparator")]
    path_separator: String,
    // repo: String,
    version: String,
}

pub fn set_app_dir() -> bool {
    let binding = get_current_root_dir();
    let root = Path::new(&binding);
    if env::set_current_dir(root).is_ok() {
        return true;
    }
    false
}

#[cfg(not(debug_assertions))]
fn get_current_root_dir() -> String {
    return "./".to_string();
}

// In debug mode, the user-files dir is "src-tauri", need to set it to the root dir of the project.
#[cfg(debug_assertions)]
fn get_current_root_dir() -> String {
    "../".to_string()
}

fn get_context() -> tauri::Context<EmbeddedAssets> {
    tauri::generate_context!("tauri.conf.json")
}

pub fn app_name() -> String {
    match &get_context().config().package.product_name {
        Some(name) => name.to_string(),
        None => "".to_string(),
    }
}

pub fn version() -> String {
    match &get_context().config().package.version {
        Some(ver) => ver.to_string(),
        None => "".to_string(),
    }
}

fn get_document_dir() -> PathBuf {
    let document_dir = match dirs::document_dir() {
        Some(a) => a,
        None => panic!("Unable to find the path to the document directory."),
    };
    return document_dir;
}

pub fn get_app_core_conf() -> AppCoreConf {
    let mut document_dir = get_document_dir();

    document_dir.push(app_name());
    let home_dir = document_dir.to_string_lossy().to_string();

    document_dir.push("user-files");
    let user_files_dir_default = document_dir.to_string_lossy().to_string();

    document_dir = get_document_dir();
    document_dir.push(app_name());
    document_dir.push("logDir");
    document_dir.push(format!("{}{}", app_name(), conf::LOG_FILE_EXT));
    let log_dir = document_dir.to_string_lossy().to_string();

    AppCoreConf {
        // app_name: app_name(),
        home_dir,
        log_file_path: log_dir,
        user_files_dir_default,
        path_separator: std::path::MAIN_SEPARATOR_STR.to_owned(),
        // repo: x_conf::PROJECT_REPO.to_string(),
        version: version(),
    }
}
