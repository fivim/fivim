use std::{
    fs::{self, DirEntry, File},
    io::{self, Read, Write},
    path::Path,
    time::SystemTime,
};

use crate::utils::dir as x_dir;
use crate::utils::logger as x_logger;
use crate::utils::path as x_path;
use base64::decode;

pub fn file_size(file_path: &str) -> u64 {
    match fs::metadata(&file_path) {
        Ok(metadata) => return metadata.len(),
        Err(_) => return 0,
    }
}

pub fn read_file_to_string(file_path: &str) -> Result<String, io::Error> {
    let mut f = match File::open(&file_path) {
        Ok(file) => file,
        Err(e) => {
            x_logger::log_error(&format!(
                ">>> read_file_to_string error, path: {}, error: {}\n",
                file_path, e
            ));
            return Err(e);
        }
    };

    let mut s = String::new();
    match f.read_to_string(&mut s) {
        Ok(_) => Ok(s),
        Err(e) => Err(e),
    }
}

pub fn read_file_to_bytes(file_path: &str) -> Result<Vec<u8>, io::Error> {
    let mut f = match File::open(&file_path) {
        Ok(file) => file,
        Err(e) => {
            x_logger::log_error(&format!(
                ">>> read_file_to_bytes error, path: {}, error: {}\n",
                file_path, e
            ));
            return Err(e);
        }
    };

    let mut buf: Vec<u8> = vec![0; file_size(&file_path) as usize];
    match f.read(&mut buf) {
        Ok(_) => Ok(buf),
        Err(e) => Err(e),
    }
}

pub fn write_string_into_file(file_path: &str, file_content: &str) -> Result<bool, io::Error> {
    x_dir::check_dir_or_create(x_path::get_parent_dir_in_path_string(file_path).as_str());

    let mut f = match File::create(&file_path) {
        Ok(file) => file,
        Err(e) => {
            x_logger::log_error(&format!(
                ">>> write_string_into_file error, path: {}, error: {}\n",
                file_path, e
            ));
            return Err(e);
        }
    };

    if let Err(e) = f.write_all(file_content.as_bytes()) {
        return Err(e);
    }
    Ok(true)
}

pub fn write_bytes_into_file(file_path: &str, file_content: &Vec<u8>) -> Result<bool, io::Error> {
    x_dir::check_dir_or_create(x_path::get_parent_dir_in_path_string(&file_path).as_str());

    let mut f = match File::create(&file_path) {
        Ok(file) => file,
        Err(e) => {
            x_logger::log_error(&format!(
                ">>> write_bytes_into_file create error, path: {}, error: {}\n",
                &file_path, e
            ));
            return Err(e);
        }
    };

    if let Err(e) = f.write_all(&file_content) {
        print!(
            ">>> write_bytes_into_file write_all error, path: {}, error: {}\n",
            &file_path, e
        );
        return Err(e);
    }
    Ok(true)
}

pub fn write_base64_into_file(file_path: &str, file_content_base64: &str) -> bool {
    let mut file_content_string = "".to_string();

    // Remove the prefix of base64 string, such as: "data:image/png;base64,"
    let separator = ";base64,";
    if file_content_base64.contains(separator) {
        let arr: Vec<&str> = file_content_base64.split(separator).collect();
        if arr.len() >= 2 {
            file_content_string = arr[1].to_string();
        } else {
            return false;
        }
    } else {
        file_content_string = file_content_base64.to_owned();
    }

    match decode(file_content_string) {
        Ok(d) => {
            match write_bytes_into_file(file_path, &d) {
                Ok(_) => return true,
                Err(_) => return false,
            };
        }
        Err(e) => {
            x_logger::log_error(&format!(">>> decode base64 error:: {}\n", e));
            return false;
        }
    }
}

pub fn copy_file(path_str: &str, target_path_str: &str) -> bool {
    match fs::copy(path_str, target_path_str) {
        Ok(_) => return true,
        Err(_) => return false,
    }
}

pub fn delete_file(path_str: &str) -> bool {
    match fs::remove_file(path_str) {
        Ok(_) => return true,
        Err(_) => return false,
    }
}

pub fn exist_file(path_str: &str) -> bool {
    return Path::new(&path_str).exists();
}

pub fn get_file_modified_time_f64(entry: &DirEntry) -> f64 {
    let mmm = entry.metadata().unwrap();
    let modified = mmm.modified().unwrap();

    if let Ok(time) = modified.duration_since(SystemTime::UNIX_EPOCH) {
        return time.as_secs_f64();
    } else {
        return 0.0;
    }
}
