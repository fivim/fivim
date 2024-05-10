#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

extern crate custom_error;
extern crate lazy_static;

use std::env;

mod commands;
mod conf;
mod dir;
mod log;
mod menu;

fn main() {
    log::init_log();
    dir::set_app_dir();

    let app = tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // encrypt_hash
            commands::encrypt_hash::encrypt_string_into_file,
            commands::encrypt_hash::decrypt_file_to_string,
            commands::encrypt_hash::decrypt_string,
            commands::encrypt_hash::encrypt_string,
            commands::encrypt_hash::encrypt_string_array,
            commands::encrypt_hash::decrypt_string_array,
            commands::encrypt_hash::encrypt_local_file,
            commands::encrypt_hash::encrypt_local_file_content_base64,
            commands::encrypt_hash::decrypt_local_file,
            commands::encrypt_hash::decrypt_local_file_base64,
            commands::encrypt_hash::sha256_by_file_path,
            commands::encrypt_hash::string_crc32,
            commands::encrypt_hash::string_sha256,
            // fs
            commands::fs::copy_file,
            commands::fs::add_file,
            commands::fs::delete_file,
            commands::fs::exist_file,
            commands::fs::read_file_to_string,
            commands::fs::write_base64_into_file,
            commands::fs::write_string_into_file,
            commands::fs::write_bytes_into_file,
            commands::fs::read_file_to_base64_string,
            commands::fs::add_dir,
            commands::fs::delete_dir,
            commands::fs::get_dir_size,
            commands::fs::list_dir_children,
            commands::fs::rename,
            commands::fs::update_file_modified_time,
            commands::fs::file_info,
            commands::fs::tree_info,
            commands::fs::walk_dir_items_get_path_and_modify_time,
            commands::fs::walk_dir_items_get_path,
            commands::fs::zip_dir,
            commands::fs::unzip_file,
            // net
            commands::net::download_file,
            commands::net::http_request,
            // other
            commands::other::get_app_core_conf,
            commands::other::log,
            commands::other::log_info,
            commands::other::log_error,
            commands::other::log_debug,
            commands::other::get_progress,
            commands::other::json_to_toml,
            commands::other::toml_to_json
        ])
        .setup(|app| {
            menu::make_tray_menu(app)?;

            // #[cfg(any(windows, target_os = "macos"))]
            // {
            //     use window_shadows::set_shadow;
            //     let main_window = app.get_window(conf::WINDOW_LABEL_MAIN).unwrap();
            //     set_shadow(&main_window, true).expect("Unsupported platform!");
            // }

            // let splashscreen_window = app.get_window(conf::WINDOW_LABEL_SPLASHSCREEN).unwrap();
            // // we perform the initialization code on a new task so the app doesn't crash
            // tauri::async_runtime::spawn(async move {
            //     splashscreen_window.close().unwrap();
            //     main_window.show().unwrap();
            // });

            Ok(())
        })
        //Keep the app running in the background after closing all windows
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|_app_handle, event| {
        if let tauri::RunEvent::ExitRequested { api, .. } = event {
            api.prevent_exit();
        }
    });
}
