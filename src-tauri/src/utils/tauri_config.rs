use serde::{Deserialize, Serialize};
use std::path::Path;

use tauri::api::path as t_path;
use tauri::utils::assets::EmbeddedAssets;

use crate::conf as x_conf;
use crate::utils::path as x_path;

#[derive(Serialize, Deserialize, Debug)]
pub struct AppCoreConf {
    appName: String,               // Javascript naming style
    defaultLocale: String,         // Javascript naming style
    defaultLocaleInNative: String, // Javascript naming style
    homeAppDir: String,            // Javascript naming style
    homeDir: String,               // Javascript naming style
    version: String,
}

fn get_context() -> tauri::Context<EmbeddedAssets> {
    return tauri::generate_context!("tauri.conf.json");
}

pub fn app_name() -> String {
    match &get_context().config().package.product_name {
        Some(name) => return name.to_string(),
        None => return "".to_string(),
    }
}

pub fn version() -> String {
    match &get_context().config().package.version {
        Some(ver) => return ver.to_string(),
        None => return "".to_string(),
    }
}

pub fn home_dir() -> String {
    match t_path::home_dir() {
        Some(dir) => return x_path::path_buf_to_string(dir.join("")),
        None => return "".to_string(),
    }
}

pub fn home_app_dir() -> String {
    x_path::path_buf_to_string(
        Path::new(&home_dir())
            .join(&format!(".{}", app_name()))
            .join(""),
    )
}

pub fn get_app_core_conf() -> AppCoreConf {
    let res = AppCoreConf {
        appName: app_name(),
        defaultLocale: x_conf::DEFAULT_LANGUAGE.to_string(),
        defaultLocaleInNative: x_conf::DEFAULT_LANGUAGE_IN_NATIVE_WORD.to_string(),
        homeAppDir: home_app_dir(),
        homeDir: home_dir(),
        version: version(),
    };

    return res;
}
