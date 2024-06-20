use fivim_rs_commands::net as rc;
use fivim_rs_utils::web::{self as xu_web};
use std::collections::{hash_map::RandomState, HashMap};

#[tauri::command]
pub async fn download_file(
    method: String,
    url: String,
    header_map: HashMap<String, String, RandomState>,
    params_map: HashMap<String, String, RandomState>,
    file_path: String,
    is_large_file: bool,
    progress_name: String,
) -> Result<bool, String> {
    match rc::download_file(
        &method,
        &url,
        &header_map,
        &params_map,
        &file_path,
        is_large_file,
        &progress_name,
    )
    .await
    {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!("download_file error: {}", e.to_string())),
    }
}

#[tauri::command]
pub async fn http_request(
    method: String,
    url: String,
    header_map: HashMap<String, String, RandomState>,
    params_map: HashMap<String, String, RandomState>,
    body: String,
    resp_data_type: String,
) -> Result<xu_web::HttpResponse, String> {
    match rc::http_request(
        &method,
        &url,
        &header_map,
        &params_map,
        &body,
        &resp_data_type,
    )
    .await
    {
        Ok(sss) => Ok(sss),
        Err(e) => Err(format!("http_request error: {}", e.to_string())),
    }
}
