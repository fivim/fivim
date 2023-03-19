use std::path::{Path, PathBuf};
use std::{env, error::Error, fs};

use serde::{Deserialize, Serialize};

use crate::utils::file as x_file;

pub fn get_current_dir() -> String {
    return env::current_dir().unwrap().to_str().unwrap().into();
}

pub fn get_all_child_dir(root_path: &str) -> Result<Vec<String>, Box<dyn Error>> {
    let mut path_list = vec![root_path.to_string()];
    let mut start_index = 0;

    loop {
        let list_len = path_list.len();
        for index in start_index..path_list.len() {
            let path = &path_list[index];
            if fs::metadata(path)?.is_dir() {
                for child_dir in fs::read_dir(&path)? {
                    path_list.push(child_dir?.path().as_os_str().to_str().unwrap().to_string());
                }
            }
        }
        if list_len == start_index {
            break;
        }
        start_index = list_len;
    }
    return Ok(path_list);
}

// Including file type only
pub fn get_file_list_of_dir(dir: &str) -> Vec<String> {
    let mut res: Vec<String> = Vec::new();

    match fs::read_dir(dir) {
        Ok(rd) => {
            for entry in rd {
                let entry = entry.unwrap();
                res.push(entry.file_name().into_string().unwrap());
            }
        }
        Err(e) => {
            print!(
                ">>> get_file_list_of_dir read_dir({}) error: {}\n",
                &dir, e
            );
        },
    }

    return res;
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DirChildren {
    file_name: String,
    is_dir: bool,
    modified_time_stamp: f64,
}

// Including file and dir, if **is_dir** is true, it is a directory, or it is a file
pub fn get_children_list_of_dir(dir: &str) -> Vec<DirChildren> {
    let mut res: Vec<DirChildren> = Vec::new();

    match fs::read_dir(&dir) {
        Ok(children) => {
            for entry in children {
                let entry = entry.unwrap();
                let item = DirChildren {
                    file_name: entry.file_name().into_string().unwrap(),
                    is_dir: entry.path().is_dir(),
                    modified_time_stamp: x_file::get_file_modified_time_f64(&entry),
                };
                res.push(item);
            }
        }
        Err(e) => {
            print!(
                ">>> get_children_list_of_dir read_dir({}) error: {}\n",
                &dir, e
            );
        }
    };

    return res;
}

pub fn set_app_dir() -> bool {
    let binding = get_current_root_dir();
    let root = Path::new(&binding);
    if env::set_current_dir(root).is_ok() {
        return true;
    }
    return false;
}

#[cfg(not(debug_assertions))]
fn get_current_root_dir() -> String {
    return "./".to_string();
}

// In debug mode, the work dir is "src-tauri", need to set it to the root dir of the project.
#[cfg(debug_assertions)]
fn get_current_root_dir() -> String {
    return "../".to_string();
}

pub fn path_buf_to_string(path_buf: PathBuf) -> String {
    return path_buf.into_os_string().into_string().unwrap();
}