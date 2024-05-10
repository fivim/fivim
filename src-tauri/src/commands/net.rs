use enassi_rs_commands::net as rc;
use enassi_rs_utils::web::{self as xu_web, HttpResponse};
use log::error;
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
) -> bool {
    return match rc::download_file(
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
        Ok(rrr) => rrr,
        Err(e) => {
            error!("download_file error: {e}");
            false
        }
    };
}

#[tauri::command]
pub async fn http_request(
    method: String,
    url: String,
    header_map: HashMap<String, String, RandomState>,
    params_map: HashMap<String, String, RandomState>,
    body: String,
    resp_data_type: String,
) -> xu_web::HttpResponse {
    return match rc::http_request(
        &method,
        &url,
        &header_map,
        &params_map,
        &body,
        &resp_data_type,
    )
    .await
    {
        Ok(rrr) => rrr,
        Err(e) => {
            error!("http_request error: {e}");
            let mut res = HttpResponse::new();
            res.error_msg = format!("http_request error: {e}");
            res
        }
    };
}
