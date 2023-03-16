use tauri::{
    CustomMenuItem, Manager, Menu, Submenu, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItem,
};

use crate::conf;

// Create the main menu:
pub fn make_window_menu() -> tauri::Menu {
    let file_quit = CustomMenuItem::new(conf::TEXT_EXIT, conf::TEXT_EXIT);
    let file_close = CustomMenuItem::new(conf::TEXT_CLOSE, conf::TEXT_CLOSE);
    let menu_file = Submenu::new(
        conf::TEXT_FILE,
        Menu::new().add_item(file_quit).add_item(file_close),
    );
    return Menu::new()
        .add_submenu(menu_file)
        // .add_native_item(MenuItem::Copy)
        .add_item(CustomMenuItem::new(conf::TEXT_HELP, conf::TEXT_HELP));
}

// Create the tray menu:
pub fn make_tray_menu(app: &tauri::App) -> tauri::Result<()> {
    let tray_id = "enas-tray".to_string();
    let handle = app.handle();
    let window = handle.get_window(conf::WINDOW_LABEL_MAIN).unwrap();

    let display = CustomMenuItem::new(conf::TEXT_SHOW, conf::TEXT_SHOW);
    let quit = CustomMenuItem::new(conf::TEXT_EXIT, conf::TEXT_EXIT);
    let hide = CustomMenuItem::new(conf::TEXT_HIDE, conf::TEXT_HIDE);

    let tray_menu = SystemTrayMenu::new()
        .add_item(display)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    SystemTray::new()
        .with_id(&tray_id)
        .with_menu(tray_menu)
        .on_event(move |event| {
            match event {
                SystemTrayEvent::LeftClick {
                    position: _,
                    size: _,
                    ..
                } => {
                    println!("system tray received a left click");
                }
                SystemTrayEvent::RightClick {
                    position: _,
                    size: _,
                    ..
                } => {
                    println!("system tray received a right click");
                }
                SystemTrayEvent::DoubleClick {
                    position: _,
                    size: _,
                    ..
                } => {
                    println!("system tray received a double click");
                }
                SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                    conf::TEXT_SHOW => {
                        // let window = app.get_window(conf::WINDOW_LABEL_MAIN).unwrap();
                        // let window = handle.get_window(conf::WINDOW_LABEL_MAIN).unwrap();
                        window.show().unwrap();
                    }
                    conf::TEXT_HIDE => {
                        // let window = app.get_window(conf::WINDOW_LABEL_MAIN).unwrap();
                        // let window = handle.get_window(conf::WINDOW_LABEL_MAIN).unwrap();
                        window.hide().unwrap();
                    }
                    conf::TEXT_EXIT => {
                        std::process::exit(0);
                    }
                    _ => {}
                },
                _ => {}
            }
        })
        .build(app)
        .map(|_| ())
}

pub async fn system_tray_update_text(app_handle: tauri::AppHandle) {
    app_handle
        .tray_handle()
        .get_item(conf::TEXT_SHOW)
        .set_title(conf::TEXT_SHOW).unwrap();
    app_handle
        .tray_handle()
        .get_item(conf::TEXT_EXIT)
        .set_title(conf::TEXT_EXIT).unwrap();
    app_handle
        .tray_handle()
        .get_item(conf::TEXT_HIDE)
        .set_title(conf::TEXT_HIDE).unwrap();
}
