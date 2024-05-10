use log::LevelFilter;
use log4rs::{
    append::console::ConsoleAppender,
    config::{Appender, Config, Logger, Root},
    encode::pattern::PatternEncoder,
};

pub fn init_log() {
    // let is_debug = env::var("RUST_LOG").is_ok();

    // let mut log_level = LevelFilter::Info;

    // if is_debug {
    //     log_level = LevelFilter::Debug;
    // }

    // https://docs.rs/log4rs/1.3.0/log4rs/encode/pattern/index.html

    let stdout = ConsoleAppender::builder()
        .encoder(Box::new(PatternEncoder::new(
            "{d(%Y-%m-%d %H:%M:%S)} {t}:{L} {l} >>>{m}<<<{n}",
        )))
        .build();

    // debug
    let stdout_debug = ConsoleAppender::builder()
        .encoder(Box::new(PatternEncoder::new(
            "{d(%Y-%m-%d %H:%M:%S)} {t}:{L} \x1b[36m{l}\x1b[0m >>>{m}<<<{n}",
        )))
        .build();

    // info
    let stdout_info = ConsoleAppender::builder()
        .encoder(Box::new(PatternEncoder::new(
            "{d(%Y-%m-%d %H:%M:%S)} {t}:{L} \x1b[32m{l}\x1b[0m >>>{m}<<<{n}",
        )))
        .build();

    // warning
    let stdout_warn = ConsoleAppender::builder()
        .encoder(Box::new(PatternEncoder::new(
            "{d(%Y-%m-%d %H:%M:%S)} {t}:{L} \x1b[33m{l}\x1b[0m >>>{m}<<<{n}",
        )))
        .build();

    // error
    let stdout_error = ConsoleAppender::builder()
        .encoder(Box::new(PatternEncoder::new(
            "{d(%Y-%m-%d %H:%M:%S)} {t}:{L} \x1b[31m{l}\x1b[0m {m}{n}",
        )))
        .build();

    let config = match Config::builder()
        .appender(Appender::builder().build("stdout", Box::new(stdout)))
        .appender(Appender::builder().build("stdout_debug", Box::new(stdout_debug)))
        .appender(Appender::builder().build("stdout_info", Box::new(stdout_info)))
        .appender(Appender::builder().build("stdout_warn", Box::new(stdout_warn)))
        .appender(Appender::builder().build("stdout_error", Box::new(stdout_error)))
        .logger(
            Logger::builder()
                .appender("stdout_debug")
                .additive(false)
                .build("stdout_debug", LevelFilter::Debug),
        )
        .logger(
            Logger::builder()
                .appender("stdout_info")
                .additive(false)
                .build("stdout_info", LevelFilter::Info),
        )
        .logger(
            Logger::builder()
                .appender("stdout_warn")
                .additive(false)
                .build("stdout_warn", LevelFilter::Warn),
        )
        // .logger(
        //     Logger::builder()
        //         .appender("stdout_error")
        //         .additive(false)
        //         .build("stdout_error", LevelFilter::Error),
        // )
        // TODO: Please confirm if root can use the error level and if other levels can enter.
        .build(
            Root::builder()
                .appender("stdout_error")
                .build(LevelFilter::Error),
        ) {
        Ok(ccc) => ccc,
        Err(e) => panic!("{}", e),
    };
    let _handle = log4rs::init_config(config).unwrap();
}
