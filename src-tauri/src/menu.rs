use crate::conf;
use fivim_rs_utils::logger as xu_logger;
use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};

// Create the tray menu:
pub fn make_tray_menu(app: &tauri::App) -> tauri::Result<()> {
    let tray_id = conf::TRAY_ID.to_string();
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
        .with_id(tray_id)
        .with_menu(tray_menu)
        .on_event(move |event| match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                xu_logger::log_info("system tray received a left click");
            }
            SystemTrayEvent::RightClick {
                position: _,
                size: _,
                ..
            } => {
                xu_logger::log_info("system tray received a right click");
            }
            SystemTrayEvent::DoubleClick {
                position: _,
                size: _,
                ..
            } => {
                xu_logger::log_info("system tray received a double click");
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                conf::TEXT_SHOW => {
                    window.show().unwrap();
                }
                conf::TEXT_HIDE => {
                    window.hide().unwrap();
                }
                conf::TEXT_EXIT => {
                    std::process::exit(0);
                }
                _ => {}
            },
            _ => {}
        })
        .build(app)
        .map(|_| ())
}
