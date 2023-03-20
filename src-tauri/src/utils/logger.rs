// #[macro_use] extern crate log;
// extern crate simplelog;

use log::*;
use simplelog::*;

use std::{fs::File, path::Path};

pub fn init_logger(dir_path: &str, file_name: &str) {
    let file_path = Path::new(dir_path).join(file_name);

    CombinedLogger::init(vec![
        TermLogger::new(
            LevelFilter::Warn,
            Config::default(),
            TerminalMode::Mixed,
            ColorChoice::Auto,
        ),
        WriteLogger::new(
            LevelFilter::Info,
            Config::default(),
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
