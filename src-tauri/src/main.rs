#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[macro_use]
extern crate lazy_static;
extern crate custom_error;

use std::path::Path;
use tauri::Manager;

mod commands;
mod conf;
mod data_file_parse;
mod i18n;
mod menu;
mod utils;

fn main() {
    utils::tauri::set_app_dir();
    xutils::logger::init_logger(utils::logger::gen_logger_file_path());

    let app = tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // core
            commands::close_splashscreen,
            commands::get_app_core_conf,
            commands::get_dict_json,
            commands::get_locale,
            commands::set_locale,
            commands::system_tray_update_text,
            // file
            commands::copy_file,
            commands::delete_file,
            commands::get_file_bytes,
            commands::get_file_meta,
            commands::exist_file,
            commands::read_file_to_bytes,
            commands::read_file_to_string,
            commands::sha256_by_file_path,
            commands::write_base64_into_file,
            commands::write_bytes_into_file,
            commands::write_string_into_file,
            // dir
            commands::delete_dir,
            commands::get_dir_size,
            commands::list_dir_children,
            // fs
            commands::rename,
            // log
            commands::log,
            // encrypt
            commands::decrypt_string,
            commands::encrypt_string,
            commands::string_crc32,
            // user data file
            commands::read_user_data_file,
            commands::write_user_data_file,
            commands::re_encrypt_file,
            // http
            commands::http_request,
            // other
            commands::get_progress,
            commands::download_file,
        ])
        .setup(|app| {
            menu::make_tray_menu(app)?;

            #[cfg(any(windows, target_os = "macos"))]
            {
                use window_shadows::set_shadow;
                let main_window = app.get_window(conf::WINDOW_LABEL_MAIN).unwrap();
                set_shadow(&main_window, true).expect("Unsupported platform!");
            }

            // let splashscreen_window = app.get_window(conf::WINDOW_LABEL_SPLASHSCREEN).unwrap();
            // // we perform the initialization code on a new task so the app doesn't crash
            // tauri::async_runtime::spawn(async move {
            //     splashscreen_window.close().unwrap();
            //     main_window.show().unwrap();
            // });

            // Get locales dir path, and init i18n dict
            // Refer: https://tauri.app/v1/guides/building/resources/
            let resource_dir = app.path_resolver().resource_dir();
            if let Some(dir) = resource_dir {
                let dir = dir.into_os_string().into_string().unwrap();
                let locales_dir = Path::new(&dir)
                    .join(conf::LOCALES_DIR_NAME) // Add the locales dir name
                    .to_str()
                    .unwrap()
                    .to_string();

                i18n::set_locales_dir(locales_dir);
                i18n::init_dict();
            }

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
