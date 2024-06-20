use fivim_rs_commands::fs as rc;
use fivim_rs_commands::types as rt;
use fivim_rs_utils::fs as xu_fs;
use log::error;

#[tauri::command]
pub fn copy_file(file_path: String, target_file_path: String) -> bool {
    match rc::copy_file(&file_path, &target_file_path) {
        Ok(_) => return true,
        Err(e) => {
            error!("copy_file error: {e}, file path: {file_path}");
            return false;
        }
    };
}

#[tauri::command]
pub fn add_file(file_path: String) -> bool {
    match rc::add_file(&file_path) {
        Ok(_) => return true,
        Err(e) => {
            error!("add_file error: {e}, file path: {file_path}");
            return false;
        }
    };
}

#[tauri::command]
pub fn delete_file(file_path: String) -> bool {
    match rc::delete_file(&file_path) {
        Ok(_) => return true,
        Err(e) => {
            error!("delete_file error: {e}, file path: {file_path}");
            return false;
        }
    };
}

#[tauri::command]
pub fn exist_file(file_path: String) -> bool {
    rc::exist_file(&file_path)
}

#[tauri::command]
pub fn read_file_to_string(file_path: String) -> String {
    match rc::read_file_to_string(&file_path) {
        Ok(sss) => return sss,
        Err(e) => {
            error!("read_file_to_string error: {e}, file path: {file_path}");
            return "".to_string();
        }
    };
}

#[tauri::command]
pub fn write_base64_into_file(file_path: String, file_content: String) -> rt::WriteFileRes {
    let mut w_res = rt::WriteFileRes::new();
    w_res.success = match rc::write_base64_into_file(&file_path, &file_content) {
        Ok(_) => true,
        Err(e) => {
            error!("write_base64_into_file error: {e}, file path: {file_path}");
            false
        }
    };
    return w_res;
}

#[tauri::command]
pub fn write_string_into_file(file_path: String, file_content: String) -> rt::WriteFileRes {
    let mut w_res = rt::WriteFileRes::new();
    w_res.success = match rc::write_string_into_file(&file_path, &file_content) {
        Ok(_) => true,
        Err(e) => {
            error!("write_string_into_file error: {e}, file path: {file_path}");
            false
        }
    };

    w_res
}

#[tauri::command]
pub fn write_bytes_into_file(file_path: String, file_content: Vec<u8>) -> rt::WriteFileRes {
    let mut w_res = rt::WriteFileRes::new();
    w_res.success = match rc::write_bytes_into_file(&file_path, &file_content) {
        Ok(_) => true,
        Err(e) => {
            error!("write_bytes_into_file error: {e}, file path: {file_path}");
            false
        }
    };
    w_res
}

#[tauri::command]
pub fn read_file_to_base64_string(file_path: String) -> String {
    match rc::read_file_to_base64_string(&file_path) {
        Ok(sss) => return sss,
        Err(e) => {
            error!("read_file_to_base64_string error: {e}, file path: {file_path}");
            return "".to_string();
        }
    };
}

#[tauri::command]
pub fn add_dir(dir_path: String) -> bool {
    match rc::add_dir(&dir_path) {
        Ok(_) => return true,
        Err(e) => {
            error!("add_dir error: {e}, dir path: {dir_path}");
            return false;
        }
    };
}

#[tauri::command]
pub fn delete_dir(dir_path: String) -> bool {
    match rc::delete_dir(&dir_path) {
        Ok(_) => return true,
        Err(e) => {
            error!("delete_dir error: {e}, dir path: {dir_path}");
            return false;
        }
    };
}

#[tauri::command]
pub fn get_dir_size(dir_path: String) -> u64 {
    match rc::get_dir_size(&dir_path) {
        Ok(sss) => return sss,
        Err(e) => {
            error!("get_dir_size error: {e}, dir path: {dir_path}");
            return 0;
        }
    }
}

#[tauri::command]
pub fn list_dir_children(dir_path: String) -> Vec<xu_fs::DirChildren> {
    match rc::list_dir_children(&dir_path) {
        Ok(sss) => return sss,
        Err(e) => {
            error!("list_dir_children error: {e}, dir path: {dir_path}");
            return [].to_vec();
        }
    }
}

#[tauri::command]
pub fn rename(path_old: String, path_new: String, is_dir: bool) -> bool {
    match rc::rename(&path_old, &path_new, is_dir) {
        Ok(_) => return true,
        Err(e) => {
            error!("rename error: {e}, old path: {path_old}, new path: {path_new}");
            return false;
        }
    };
}

#[tauri::command]
pub fn update_file_modified_time(file_path: String, iso8601_string: String) -> bool {
    match rc::update_file_modified_time(&file_path, &iso8601_string) {
        Ok(_) => return true,
        Err(e) => {
            error!("update_file_modified_time error: {e}");
            return false;
        }
    };
}

#[tauri::command]
pub fn file_info(file_path: String) -> rt::FileInfo {
    return rc::file_info(&file_path);
}

#[tauri::command]
pub fn tree_info(dir_path: String) -> xu_fs::FileNode {
    match rc::tree_info(&dir_path) {
        Ok(sss) => return sss,
        Err(e) => {
            error!("tree_info error: {e}, dir path: {dir_path}");
            return xu_fs::FileNode::new();
        }
    }
}

#[tauri::command]
pub fn walk_dir_items_get_path_and_modify_time(
    file_path: String,
    dir_path: String,
    exclude_dires: Vec<String>,
    ssep: String,
) -> String {
    match rc::walk_dir_items_get_path_and_modify_time(&file_path, &dir_path, &exclude_dires, &ssep)
    {
        Ok(sss) => return sss,
        Err(e) => {
            error!("walk_dir_items_get_path_and_modify_time error: {e}");
            return "".to_string();
        }
    };
}

#[tauri::command]
pub fn walk_dir_items_get_path(dir_path: String, exclude_dires: Vec<String>) -> Vec<String> {
    match rc::walk_dir_items_get_path(&dir_path, &exclude_dires) {
        Ok(sss) => return sss,
        Err(e) => {
            error!("walk_dir_items_get_path error: {e}");
            return [].to_vec();
        }
    };
}

#[tauri::command]
pub fn zip_dir(file_path: String, dir_path: String) -> bool {
    match rc::zip_dir(&file_path, &dir_path) {
        Ok(_) => return true,
        Err(e) => {
            error!("zip_dir error: {e}");
            return false;
        }
    };
}

#[tauri::command]
pub fn unzip_file(file_path: String, dir_path: String) -> bool {
    match rc::unzip_file(&file_path, &dir_path) {
        Ok(_) => return true,
        Err(e) => {
            error!("unzip_file error: {e}");
            return false;
        }
    };
}
