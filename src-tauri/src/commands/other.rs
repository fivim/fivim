use crate::dir as x_dir;
use fivim_rs_commands::other as rc;
use fivim_rs_utils::progress as xu_progress;

#[tauri::command]
pub fn log(level: String, content: String) {
    rc::log(&level, &content)
}

#[tauri::command]
pub fn log_info(content: String) {
    rc::log_info(&content)
}

#[tauri::command]
pub fn log_error(content: String) {
    rc::log_error(&content)
}

#[tauri::command]
pub fn log_debug(content: String) {
    rc::log_debug(&content)
}

#[tauri::command]
pub fn get_progress(progress_name: String) -> Result<xu_progress::Status, String> {
    Ok(rc::get_progress(&progress_name))
}

/**
 * The first String is the result, the second String is  error message
 */
#[tauri::command]
pub fn json_to_toml(content: String) -> Result<String, String> {
    match rc::json_to_toml(&content) {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!("json_to_toml error: {}", e.to_string())),
    }
}

/**
 * The first String is the result, the second String is  error message
 */
#[tauri::command]
pub fn toml_to_json(content: String) -> Result<String, String> {
    match rc::toml_to_json(&content) {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!("toml_to_json error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn get_app_core_conf() -> Result<x_dir::AppCoreConf, String> {
    Ok(x_dir::get_app_core_conf())
}
