use std::collections::HashMap;
use std::path::Path;
use std::sync::Mutex;
use std::sync::RwLock;


use xutils::{dir as xu_dir, file as xu_file, logger as xu_logger, path as xu_path};

use crate::conf as x_conf;

pub struct Conf {
    locale: String,
    locales_dir: String,
}

impl Conf {
    pub fn set_locale(&mut self, lang: String) {
        self.locale = lang;
    }

    pub fn set_locales_dir(&mut self, dir: String) {
        self.locales_dir = dir;
    }
}

pub type I18nDictGlobal = HashMap<String, String>;

lazy_static! {
    #[derive(Debug)]
    static ref I18N_DICT: RwLock<I18nDictGlobal> = RwLock::new({
        
        HashMap::new()
    });

    static ref CONFIG: Mutex<Conf> = Mutex::new(Conf{
        locale: x_conf::DEFAULT_LANGUAGE.to_string(),
        locales_dir: "".to_string()
    });
}

pub fn get_locale() -> String {
    return CONFIG.lock().unwrap().locale.to_string();
}

pub fn get_locales_dir() -> String {
    return CONFIG.lock().unwrap().locales_dir.to_string();
}

pub fn set_locale(lang: String) {
    CONFIG.lock().unwrap().set_locale(lang);
}

pub fn set_locales_dir(dir: String) {
    CONFIG.lock().unwrap().set_locales_dir(dir);
}

pub fn insert_dict(k: String, v: String) {
    let mut gpw = I18N_DICT.write().unwrap();
    gpw.insert(k, v);
}

pub fn print_dict() {
    let gpr = I18N_DICT.read().unwrap();
    for pair in gpr.iter() {
        println!("print_dict: {:?}", pair);
    }
}

pub fn get_dict_json() -> String {
    let gpr = I18N_DICT.read().unwrap();
    //Refer: https://stackoverflow.com/questions/63513368/how-to-get-a-reference-to-the-object-inside-an-rwlock
    let bound = serde_json::to_string(&*gpr);

    match bound {
        Ok(s) => s,
        Err(_e) => "{}".to_string(),
    }
}

pub fn init_dict() {
    let locales_list = get_locales_list();
    let dir = get_locales_dir();

    for lang_name in locales_list {
        //Read language package
        let file_path = Path::new(&dir).join(format!("{}{}", &lang_name, x_conf::LOCALES_FILE_EXT));
        let json_str =
            match xu_file::read_to_string(xu_path::path_buf_to_string(file_path).as_str()) {
                Ok(f) => f,
                Err(e) => {
                    let msg = format!("Reading language package exception:{}", e);
                    xu_logger::log_error(&msg);
                    panic!("{}", msg);
                }
            };

        insert_dict(lang_name, json_str);
    }
}

pub fn get_locales_list() -> Vec<String> {
    let mut res: Vec<String> = Vec::new();
    let locals_dir = get_locales_dir();

    if !locals_dir.is_empty() {
        for key in xu_dir::get_file_list(&locals_dir) {
            let new_key = key.replace(x_conf::LOCALES_FILE_EXT, ""); // remove extension
            res.push(new_key);
        }
    }

    res
}
