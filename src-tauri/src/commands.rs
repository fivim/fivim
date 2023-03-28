use tauri::Manager;
use xutils::dir as xu_dir;
use xutils::file as xx_file;
use xutils::hash as xu_hash;
use xutils::logger as xu_logger;

use crate::conf as x_conf;
use crate::data_file_parse as x_parser;
use crate::i18n as x_i18n;
use crate::menu as x_menu;
use crate::utils::encrypt as x_encrypt;
use crate::utils::file as x_file;
use crate::utils::tauri as x_tauri;

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
pub fn get_app_core_conf() -> x_tauri::AppCoreConf {
    return x_tauri::get_app_core_conf();
}

#[tauri::command]
pub fn read_file_to_string(file_path: String) -> String {
    match xx_file::read_to_string(file_path.as_str()) {
        Ok(content) => return content,
        Err(_) => return "".to_string(),
    }
}

#[tauri::command]
pub fn read_file_to_bytes(file_path: String) -> Vec<u8> {
    match xx_file::read_to_bytes(file_path.as_str()) {
        Ok(content) => return content,
        Err(_) => return [].to_vec(),
    }
}

#[tauri::command]
pub fn write_base64_into_file(file_path: String, file_content_base64: String) -> bool {
    return xx_file::write_base64_str(file_path.as_str(), file_content_base64.as_str());
}

#[tauri::command]
pub fn write_bytes_into_file(file_path: String, file_content: Vec<u8>) -> bool {
    match xx_file::write_bytes(file_path.as_str(), &file_content) {
        Ok(_) => return true,
        Err(_) => return false,
    }
}

#[tauri::command]
pub fn write_string_into_file(file_path: String, file_content: String) -> bool {
    match xx_file::write_str(file_path.as_str(), file_content.as_str()) {
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
pub fn get_file_meta(file_path: String) -> x_file::FileMeta {
    return x_file::get_file_meta(file_path.as_str());
}

#[tauri::command]
pub fn sha256_by_file_path(file_path: String) -> String {
    return xu_hash::sha256_by_file_path(file_path.as_str());
}

#[tauri::command]
pub fn get_file_bytes(file_path: String) -> Vec<u8> {
    match xx_file::read_to_bytes(file_path.as_str()) {
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
    return xx_file::exists(file_path.as_str());
}

#[tauri::command]
pub fn copy_file(file_path: String, target_file_path: String) -> bool {
    return !xx_file::copy(&file_path, &target_file_path);
}

#[tauri::command]
pub fn delete_file(file_path: String) -> bool {
    return xx_file::delete(&file_path);
}

#[tauri::command]
pub fn delete_dir(dir_path: String) -> bool {
    return xu_dir::delete(&dir_path);
}

#[tauri::command]
pub fn get_dir_size(dir_path: String) -> u64 {
    return xu_dir::get_size(&dir_path);
}

#[tauri::command]
pub fn list_dir_children(dir_path: String) -> Vec<xu_dir::DirChildren> {
    return xu_dir::get_children_list(dir_path.as_str());
}

#[tauri::command]
pub fn encrypt_string(pwd: String, content: String) -> Vec<u8> {
    return x_encrypt::encrypt_bytes(pwd.as_str(), &content.as_bytes().to_vec());
}

#[tauri::command]
pub fn decrypt_string(pwd: String, content: Vec<u8>) -> String {
    return x_encrypt::decrypt_bytes_to_string(pwd.as_str(), &content.to_vec());
}

#[tauri::command]
pub fn read_user_data_file(
    pwd: String,
    file_path: String,
    always_open_in_memory: bool,
    parse_as: String,
    target_file_path: String,
) -> x_parser::UserFileData {
    match x_parser::read_file(
        pwd.as_str(),
        file_path.as_str(),
        always_open_in_memory,
        parse_as.as_str(),
        target_file_path.as_str(),
    ) {
        Ok(res) => return res,
        Err(_) => {
            return x_parser::UserFileData::new();
        }
    };
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
        Ok(res) => {
            return res;
        }
        Err(e) => {
            xu_logger::log_error(&format!(
                ">>> write_user_data_file error: {}, file_path:{}\n",
                e, file_path
            ));
            return false;
        }
    };
}

#[tauri::command]
pub fn log(level: String, content: String) {
    let level_string = level.as_str();
    let content_str = content.as_str();

    match level_string {
        "ERROR" => xu_logger::log_error(content_str),
        "INFO" => xu_logger::log_info(content_str),
        "DEBUG" => xu_logger::log_debug(content_str),
        &_ => (),
    }
}

#[tauri::command]
pub fn string_crc32(string: String) -> u32 {
    return xu_hash::crc32_by_bytes(string.as_bytes());
}
