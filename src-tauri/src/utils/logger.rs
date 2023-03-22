use log::*;
use simplelog::*;
use time::macros::format_description;

use std::{fs::File, path::Path};

pub fn init_logger(dir_path: &str, file_name: &str) {
    let file_path = Path::new(dir_path).join(file_name);
    let config_write = ConfigBuilder::new()
        .set_time_format_custom(format_description!(
            "[year]-[month]-[day] [hour]:[minute]:[second].[subsecond]"
        ))
        .build();

    CombinedLogger::init(vec![
        TermLogger::new(
            LevelFilter::Warn,
            Config::default(),
            TerminalMode::Mixed,
            ColorChoice::Auto,
        ),
        WriteLogger::new(
            LevelFilter::Info,
            config_write,
            File::create(file_path).unwrap(),
        ),
    ])
    .unwrap();
}

pub fn log_error(content: &str) {
    error!("{}", content);
}

pub fn log_info(content: &str) {
    info!("{}", content);
}

pub fn log_debug(content: &str) {
    debug!("{}", content);
}
