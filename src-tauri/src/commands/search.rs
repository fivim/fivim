use fivim_rs_commands::search as rs;

#[tauri::command]
pub fn search_in_dir(
    dir_path: String,
    is_re_mode: bool,
    search: String,
    context_size: usize,
    wrapper_prefix: String,
    wrapper_postfix: String,
    html_like_exts: Vec<String>
) -> Result<Vec<fivim_rs_utils::search::SearchFileRes>, String> {
    match rs::search_in_dir(
        dir_path,
        is_re_mode,
        search,
        context_size,
        wrapper_prefix,
        wrapper_postfix,
        &html_like_exts
    ) {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!("search_in_dir error: {}", e.to_string())),
    }
}

#[tauri::command]
pub fn search_in_file(
    file_path: String,
    is_re_mode: bool,
    search: String,
    context_size: usize,
    wrapper_prefix: String,
    wrapper_postfix: String,
    html_like_exts: Vec<String>
) -> Result<Vec<fivim_rs_utils::search::SearchFileRes>, String> {
    match rs::search_in_file(
        file_path,
        is_re_mode,
        search,
        context_size,
        wrapper_prefix,
        wrapper_postfix,
        &html_like_exts
    ) {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!("search_in_file error: {}", e.to_string())),
    }
}
