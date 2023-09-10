use std::env;
use std::path::Path;

use serde::{Deserialize, Serialize};
use tauri::api::path as t_path;
use tauri::utils::assets::EmbeddedAssets;

use crate::conf as x_conf;
use crate::utils as x_utils;
use xutils::path as x_path;

#[derive(Serialize, Deserialize, Debug)]
pub struct AppCoreConf {
    appName: String,               // Javascript naming style
    defaultLocale: String,         // Javascript naming style
    defaultLocaleInNative: String, // Javascript naming style
    homeAppDir: String,            // Javascript naming style
    homeDir: String,               // Javascript naming style
    logFilePath: String,           // Javascript naming style
    repo: String,
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

// In debug mode, the work dir is "src-tauri", need to set it to the root dir of the project.
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

pub fn home_dir() -> String {
    match t_path::home_dir() {
        Some(dir) => x_path::path_buf_to_string(dir.join("")),
        None => "".to_string(),
    }
}

pub fn home_app_dir() -> String {
    x_path::path_buf_to_string(
        Path::new(&home_dir())
            .join(format!(".{}", app_name()))
            .join(""),
    )
}

pub fn get_app_core_conf() -> AppCoreConf {
    

    AppCoreConf {
        appName: app_name(),
        defaultLocale: x_conf::DEFAULT_LANGUAGE.to_string(),
        defaultLocaleInNative: x_conf::DEFAULT_LANGUAGE_IN_NATIVE_WORD.to_string(),
        homeAppDir: home_app_dir(),
        homeDir: home_dir(),
        logFilePath: x_path::path_buf_to_string(x_utils::logger::gen_logger_file_path()),
        repo: x_conf::PROJECT_REPO.to_string(),
        version: version(),
    }
}
