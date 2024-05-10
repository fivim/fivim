use enassi_rs_commands::encrypt_hash as rc;
use log::error;

#[tauri::command]
pub fn encrypt_string_into_file(pwd: Vec<u8>, file_path: String, file_content: String) -> bool {
    match rc::encrypt_string_into_file(&pwd, &file_path, &file_content) {
        Ok(_) => return true,
        Err(e) => {
            error!("encrypt_string_into_file error: {e}");
            return false;
        }
    }
}

#[tauri::command]
pub fn decrypt_file_to_string(pwd: Vec<u8>, file_path: String) -> String {
    match rc::decrypt_file_to_string(&pwd, &file_path) {
        Ok(sss) => return sss,
        Err(e) => {
            error!("decrypt_file_to_string error: {e}");
            return "".to_string();
        }
    }
}

#[tauri::command]
pub fn decrypt_string(pwd: Vec<u8>, content: Vec<u8>) -> String {
    match rc::decrypt_string(&pwd, &content) {
        Ok(sss) => return sss,
        Err(e) => {
            error!("decrypt_string error: {e}");
            return "".to_string();
        }
    };
}

#[tauri::command]
pub fn encrypt_string(pwd: Vec<u8>, content: String) -> String {
    match rc::encrypt_string(&pwd, &content) {
        Ok(sss) => return sss,
        Err(e) => {
            error!("encrypt_string error: {e}");
            return "".to_string();
        }
    };
}

#[tauri::command]
pub fn encrypt_string_array(pwd: Vec<u8>, content: Vec<String>) -> Vec<String> {
    match rc::encrypt_string_array(&pwd, &content) {
        Ok(sss) => return sss,
        Err(e) => {
            error!("encrypt_string_array error: {e}");
            return [].to_vec();
        }
    };
}

#[tauri::command]
pub fn decrypt_string_array(pwd: Vec<u8>, content: Vec<String>) -> Vec<String> {
    match rc::decrypt_string_array(&pwd, &content) {
        Ok(sss) => return sss,
        Err(e) => {
            error!("decrypt_string_array error: {e}");
            return [].to_vec();
        }
    };
}

#[tauri::command]
pub fn encrypt_local_file(pwd: Vec<u8>, file_path_from: String, file_path_to: String) -> bool {
    match rc::encrypt_local_file(&pwd, &file_path_from, &file_path_to) {
        Ok(_) => return true,
        Err(e) => {
            error!("encrypt_local_file error: {e}");
            return false;
        }
    };
}

#[tauri::command]
pub fn encrypt_local_file_content_base64(pwd: Vec<u8>, content: Vec<u8>) -> String {
    match rc::encrypt_local_file_content_base64(&pwd, &content) {
        Ok(sss) => return sss,
        Err(e) => {
            error!("encrypt_local_file_content_base64 error: {e}");
            return "".to_string();
        }
    };
}

#[tauri::command]
pub fn decrypt_local_file(pwd: Vec<u8>, file_path_from: String, file_path_to: String) -> bool {
    match rc::decrypt_local_file(&pwd, &file_path_from, &file_path_to) {
        Ok(_) => return true,
        Err(e) => {
            error!("decrypt_local_file error: {e}");
            return false;
        }
    }
}

#[tauri::command]
pub fn decrypt_local_file_base64(pwd: Vec<u8>, file_path: String) -> String {
    match rc::decrypt_local_file_base64(&pwd, &file_path) {
        Ok(sss) => return sss,
        Err(e) => {
            error!("decrypt_local_file_base64 error: {e}");
            return "".to_string();
        }
    };
}

#[tauri::command]
pub fn sha256_by_file_path(file_path: String) -> String {
    match rc::sha256_by_file_path(&file_path) {
        Ok(sss) => return sss,
        Err(e) => {
            error!("sha256_by_file_path error: {e}");
            return "".to_string();
        }
    };
}

#[tauri::command]
pub fn string_crc32(content: String) -> u32 {
    return rc::string_crc32(&content);
}

#[tauri::command]
pub fn string_sha256(content: String) -> String {
    return rc::string_sha256(&content);
}
