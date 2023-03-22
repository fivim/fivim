use tauri::Manager;

use crate::conf as x_conf;
use crate::data_file_parse as x_parser;
use crate::i18n as x_i18n;
use crate::menu as x_menu;
use crate::utils::dir as x_dir;
use crate::utils::encrypt as x_encrypt;
use crate::utils::file as x_file;
use crate::utils::hash as x_hash;
use crate::utils::logger as x_logger;
use crate::utils::tauri_config;

/*
The tauri.windows in tauri.conf.json should have:

{
    "width": 800,
    "height": 600,
    "decorations": false,
    "url": "splashscreen.html",
    "label": "splashscreen"
}

*/
#[tauri::command]
pub async fn close_splashscreen(window: tauri::Window) {
    // Close splashscreen
    if let Some(splashscreen) = window.get_window(x_conf::WINDOW_LABEL_SPLASHSCREEN) {
        splashscreen.close().unwrap();
    }
    // Show main window
    window
        .get_window(x_conf::WINDOW_LABEL_MAIN)
        .unwrap()
        .show()
        .unwrap();
}

#[tauri::command]
pub async fn system_tray_update_text(app_handle: tauri::AppHandle) {
    x_menu::system_tray_update_text(app_handle).await;
}

#[tauri::command]
pub fn get_app_core_conf() -> tauri_config::AppCoreConf {
    return tauri_config::get_app_core_conf();
}

#[tauri::command]
pub fn read_file_to_string(file_path: String) -> String {
    match x_file::read_file_to_string(file_path.as_str()) {
        Ok(content) => return content,
        Err(_) => return "".to_string(),
    }
}

#[tauri::command]
pub fn read_file_to_bytes(file_path: String) -> Vec<u8> {
    match x_file::read_file_to_bytes(file_path.as_str()) {
        Ok(content) => return content,
        Err(_) => return [].to_vec(),
    }
}

#[tauri::command]
pub fn write_base64_into_file(file_path: String, file_content_base64: String) -> bool {
    return x_file::write_base64_into_file(file_path.as_str(), file_content_base64.as_str());
}

#[tauri::command]
pub fn write_bytes_into_file(file_path: String, file_content: Vec<u8>) -> bool {
    match x_file::write_bytes_into_file(file_path.as_str(), &file_content) {
        Ok(_) => return true,
        Err(_) => return false,
    }
}

#[tauri::command]
pub fn write_string_into_file(file_path: String, file_content: String) -> bool {
    match x_file::write_string_into_file(file_path.as_str(), file_content.as_str()) {
        Ok(_) => return true,
        Err(_) => return false,
    }
}

#[tauri::command]
pub fn get_dict_json() -> String {
    return x_i18n::get_dict_json();
}

#[tauri::command]
pub fn get_locale() -> String {
    return x_i18n::get_locale();
}

#[tauri::command]
pub fn set_locale(locale: String) {
    return x_i18n::set_locale(locale);
}

#[tauri::command]
pub fn get_file_bytes(file_path: String) -> Vec<u8> {
    match x_file::read_file_to_bytes(file_path.as_str()) {
        Ok(c) => {
            return c;
        }
        Err(_) => {
            return [].to_vec();
        }
    }
}

#[tauri::command]
pub fn exist_file(file_path: String) -> bool {
    return x_file::exist_file(file_path.as_str());
}

#[tauri::command]
pub fn copy_file(file_path: String, target_file_path: String) -> bool {
    return !x_file::copy_file(&file_path, &target_file_path);
}

#[tauri::command]
pub fn delete_file(file_path: String) -> bool {
    return x_file::delete_file(&file_path);
}

#[tauri::command]
pub fn delete_dir(dir_path: String) -> bool {
    return x_dir::delete_dir(&dir_path);
}

#[tauri::command]
pub fn get_dir_size(dir_path: String) -> u64 {
    return x_dir::get_dir_size(&dir_path);
}

#[tauri::command]
pub fn list_dir_children(dir_path: String) -> Vec<x_dir::DirChildren> {
    return x_dir::get_children_list_of_dir(dir_path.as_str());
}

#[tauri::command]
pub fn sha256_by_file_path(file_path: String) -> String {
    return x_hash::sha256_by_file_path(file_path.as_str());
}

#[tauri::command]
pub fn encrypt_file(pwd: String, source_path: String, dist_path: String) -> bool {
    return x_encrypt::encrypt_file(
        pwd.as_str(),
        source_path.as_str(),
        dist_path.as_str(),
        &[0].to_vec(),
        &[0].to_vec(),
    );
}

#[tauri::command]
pub fn decrypt_file(pwd: String, source_path: String, dist_path: String) -> bool {
    return x_encrypt::decrypt_file(pwd.as_str(), source_path.as_str(), dist_path.as_str());
}

#[tauri::command]
pub fn encrypt_string(pwd: String, content: String) -> Vec<u8> {
    return x_encrypt::encrypt_bytes(pwd.as_str(), content.as_bytes());
}

#[tauri::command]
pub fn decrypt_string(pwd: String, content: Vec<u8>) -> String {
    return x_encrypt::decrypt_bytes(pwd.as_str(), &content.to_vec());
}

#[tauri::command]
pub fn read_user_data_file(
    pwd: String,
    file_path: String,
    parse_as_string: bool,
) -> x_parser::UserFileData {
    return x_parser::read_file(pwd.as_str(), file_path.as_str(), parse_as_string);
}

#[tauri::command]
pub fn write_user_data_file(
    pwd: String,
    file_path: String,
    file_name: String,
    file_content: Vec<u8>,
    source_of_large_file_path: String,
) -> bool {
    match x_parser::write_file(
        pwd.as_str(),
        file_path.as_str(),
        file_name.as_str(),
        file_content,
        source_of_large_file_path.as_str(),
    ) {
        Ok(_) => return true,
        Err(e) => {
            x_logger::log_error(&format!(">>> write_user_data_file error: {}\n", e));
            return false;
        }
    };
}

#[tauri::command]
pub fn log(level: String, content: String) {
    let level_string = level.as_str();
    let content_str = content.as_str();

    match level_string {
        "ERROR" => x_logger::log_error(content_str),
        "INFO" => x_logger::log_info(content_str),
        "DEBUG" => x_logger::log_debug(content_str),
        &_ => todo!(),
    }
}

#[tauri::command]
pub fn string_crc32(string: String) -> u32 {
    return x_hash::crc32_by_bytes(string.as_bytes());
}
