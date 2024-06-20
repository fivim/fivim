use fivim_rs_commands::encrypt_hash as rc;

#[tauri::command]
pub fn encrypt_string_into_file(
    pwd: Vec<u8>,
    file_path: String,
    file_content: String,
) -> Result<bool, String> {
    match rc::encrypt_string_into_file(&pwd, &file_path, &file_content) {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("encrypt_string_into_file error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn decrypt_file_to_string(pwd: Vec<u8>, file_path: String) -> Result<String, String> {
    match rc::decrypt_file_to_string(&pwd, &file_path) {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!("decrypt_file_to_string error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn decrypt_string(pwd: Vec<u8>, content: Vec<u8>) -> Result<String, String> {
    match rc::decrypt_string(&pwd, &content) {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!("decrypt_string error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn encrypt_string(pwd: Vec<u8>, content: String) -> Result<String, String> {
    match rc::encrypt_string(&pwd, &content) {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!("encrypt_string error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn encrypt_string_array(pwd: Vec<u8>, content: Vec<String>) -> Result<Vec<String>, String> {
    match rc::encrypt_string_array(&pwd, &content) {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!("encrypt_string_array error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn decrypt_string_array(pwd: Vec<u8>, content: Vec<String>) -> Result<Vec<String>, String> {
    match rc::decrypt_string_array(&pwd, &content) {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!("decrypt_string_array error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn encrypt_local_file(
    pwd: Vec<u8>,
    file_path_from: String,
    file_path_to: String,
) -> Result<bool, String> {
    match rc::encrypt_local_file(&pwd, &file_path_from, &file_path_to) {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("encrypt_local_file error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn encrypt_local_file_content_base64(pwd: Vec<u8>, content: Vec<u8>) -> Result<String, String> {
    match rc::encrypt_local_file_content_base64(&pwd, &content) {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!(
            "encrypt_local_file_content_base64 error: {}",
            e.to_string()
        )),
    }
}

#[tauri::command]
pub fn decrypt_local_file(
    pwd: Vec<u8>,
    file_path_from: String,
    file_path_to: String,
) -> Result<bool, String> {
    match rc::decrypt_local_file(&pwd, &file_path_from, &file_path_to) {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("decrypt_local_file error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn decrypt_local_file_base64(pwd: Vec<u8>, file_path: String) -> Result<String, String> {
    match rc::decrypt_local_file_base64(&pwd, &file_path) {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!(
            "decrypt_local_file_base64 error: {}",
            e.to_string()
        )),
    }
}

#[tauri::command]
pub fn sha256_by_file_path(file_path: String) -> Result<String, String> {
    match rc::sha256_by_file_path(&file_path) {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!("sha256_by_file_path error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn string_crc32(content: String) -> Result<u32, String> {
    Ok(rc::string_crc32(&content))
}

#[tauri::command]
pub fn string_sha256(content: String) -> Result<String, String> {
    Ok(rc::string_sha256(&content))
}
