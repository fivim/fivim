use fivim_rs_commands::fs as rc;
use fivim_rs_commands::types as rt;
use fivim_rs_utils::fs as xu_fs;

#[tauri::command]
pub fn copy_file(file_path: String, target_file_path: String) -> Result<bool, String> {
    match rc::copy_file(&file_path, &target_file_path) {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("copy_file error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn add_file(file_path: String) -> Result<bool, String> {
    match rc::add_file(&file_path) {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("add_file error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn delete_file(file_path: String) -> Result<bool, String> {
    match rc::delete_file(&file_path) {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("delete_file error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn exist_file(file_path: String) -> Result<bool, String> {
    Ok(rc::exist_file(&file_path))
}

#[tauri::command]
pub fn read_file_to_string(file_path: String) -> Result<String, String> {
    match rc::read_file_to_string(&file_path) {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!("encrypt_string_into_file error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn write_base64_into_file(
    file_path: String,
    file_content: String,
) -> Result<rt::WriteFileRes, String> {
    match rc::write_base64_into_file(&file_path, &file_content) {
        Ok(_) => {
            let mut write_file_res = rt::WriteFileRes::new();
            write_file_res.success = true;
            Ok(write_file_res)
        }
        Err(e) => Err(format!("write_base64_into_file error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn write_string_into_file(
    file_path: String,
    file_content: String,
) -> Result<rt::WriteFileRes, String> {
    match rc::write_string_into_file(&file_path, &file_content) {
        Ok(_) => {
            let mut write_file_res = rt::WriteFileRes::new();
            write_file_res.success = true;
            Ok(write_file_res)
        }
        Err(e) => Err(format!("write_string_into_file error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn write_bytes_into_file(
    file_path: String,
    file_content: Vec<u8>,
) -> Result<rt::WriteFileRes, String> {
    match rc::write_bytes_into_file(&file_path, &file_content) {
        Ok(_) => {
            let mut write_file_res = rt::WriteFileRes::new();
            write_file_res.success = true;
            Ok(write_file_res)
        }
        Err(e) => Err(format!("write_bytes_into_file error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn read_file_to_base64_string(file_path: String) -> Result<String, String> {
    match rc::read_file_to_base64_string(&file_path) {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!("encrypt_string_into_file error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn add_dir(dir_path: String) -> Result<bool, String> {
    match rc::add_dir(&dir_path) {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("add_dir error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn delete_dir(dir_path: String) -> Result<bool, String> {
    match rc::delete_dir(&dir_path) {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("delete_dir error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn get_dir_size(dir_path: String) -> Result<u64, String> {
    match rc::get_dir_size(&dir_path) {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!("get_dir_size error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn list_dir_children(dir_path: String) -> Result<Vec<xu_fs::DirChildren>, String> {
    match rc::list_dir_children(&dir_path) {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!("list_dir_children error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn rename(path_old: String, path_new: String, is_dir: bool) -> Result<bool, String> {
    match rc::rename(&path_old, &path_new, is_dir) {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("rename error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn update_file_modified_time(
    file_path: String,
    iso8601_string: String,
) -> Result<bool, String> {
    match rc::update_file_modified_time(&file_path, &iso8601_string) {
        Ok(_) => Ok(true),
        Err(e) => Err(format!(
            "update_file_modified_time error: {}",
            e.to_string()
        )),
    }
}

#[tauri::command]
pub fn file_info(file_path: String) -> Result<rt::FileInfo, String> {
    Ok(rc::file_info(&file_path))
}

#[tauri::command]
pub fn tree_info(dir_path: String) -> Result<xu_fs::FileNode, String> {
    match rc::tree_info(&dir_path) {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!("tree_info error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn walk_dir_items_get_path_and_modify_time(
    file_path: String,
    dir_path: String,
    exclude_dires: Vec<String>,
    ssep: String,
) -> Result<String, String> {
    match rc::walk_dir_items_get_path_and_modify_time(&file_path, &dir_path, &exclude_dires, &ssep)
    {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!(
            "walk_dir_items_get_path_and_modify_time error: {}",
            e.to_string()
        )),
    }
}

#[tauri::command]
pub fn walk_dir_items_get_path(
    dir_path: String,
    exclude_dires: Vec<String>,
) -> Result<Vec<String>, String> {
    match rc::walk_dir_items_get_path(&dir_path, &exclude_dires) {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!("walk_dir_items_get_path error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn zip_dir(file_path: String, dir_path: String) -> Result<bool, String> {
    match rc::zip_dir(&file_path, &dir_path) {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("zip_dir error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn unzip_file(file_path: String, dir_path: String) -> Result<bool, String> {
    match rc::unzip_file(&file_path, &dir_path) {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("unzip_file error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn search_document_dir(
    dir_path: String,
    is_re_mode: bool,
    search: String,
    context_size: usize,
    wrapper_prefix: String,
    wrapper_postfix: String,
) -> Result<Vec<fivim_rs_utils::search::SearchFileRes>, String> {
    match rc::search_document_dir(
        dir_path,
        is_re_mode,
        search,
        context_size,
        wrapper_prefix,
        wrapper_postfix,
    ) {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!("search_document_dir error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn search_document_file(
    file_path: String,
    is_re_mode: bool,
    search: String,
    context_size: usize,
    wrapper_prefix: String,
    wrapper_postfix: String,
) -> Result<Vec<fivim_rs_utils::search::SearchFileRes>, String> {
    match rc::search_document_file(
        file_path,
        is_re_mode,
        search,
        context_size,
        wrapper_prefix,
        wrapper_postfix,
    ) {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!(
            "search_document_file_wrapper error: {}",
            e.to_string()
        )),
    }
}
