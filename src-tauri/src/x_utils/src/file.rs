use std::{
    fs::{self, DirEntry, File},
    io::{self, Read, SeekFrom, Write},
    path::Path,
    time::SystemTime,
};

use crate::dir as x_dir;
use crate::errors::EaError as x_error;
use crate::logger as x_logger;
use crate::path as x_path;

use base64::engine::{general_purpose::STANDARD as b64_STANDARD, Engine};

pub fn get_size(file_path: &str) -> u64 {
    match fs::metadata(&file_path) {
        Ok(metadata) => return metadata.len(),
        Err(_) => return 0,
    }
}

pub fn read_to_string(file_path: &str) -> Result<String, x_error> {
    let mut file = match File::open(&file_path) {
        Ok(f) => f,
        Err(e) => {
            let eee = x_error::FileOpenError {
                path: file_path.to_owned(),
                error: e,
            };
            x_logger::log_error(&format!("read_file_to_string:: {}\n", eee));
            return Err(eee);
        }
    };

    let mut s = "".to_string();
    let res = match file.read_to_string(&mut s) {
        Ok(_) => s,
        Err(e) => {
            let eee = x_error::FileReadError {
                path: file_path.to_owned(),
                error: e,
            };
            x_logger::log_error(&format!("read_file_to_string:: {}\n", eee));
            return Err(eee);
        }
    };

    Ok(res)
}

pub fn read_to_bytes(file_path: &str) -> Result<Vec<u8>, x_error> {
    let mut file = match File::open(&file_path) {
        Ok(f) => f,
        Err(e) => {
            let eee = x_error::FileOpenError {
                path: file_path.to_owned(),
                error: e,
            };
            x_logger::log_error(&format!("read_to_bytes:: {}\n", eee));
            return Err(eee);
        }
    };

    let mut buf: Vec<u8> = vec![0; get_size(&file_path) as usize];
    let res = match file.read(&mut buf) {
        Ok(_) => buf,
        Err(e) => {
            let eee = x_error::FileReadError {
                path: file_path.to_owned(),
                error: e,
            };
            x_logger::log_error(&format!("read_to_bytes:: {}\n", eee));
            return Err(eee);
        }
    };
    Ok(res)
}

pub fn write_str(file_path: &str, file_content: &str) -> Result<bool, x_error> {
    x_dir::check_or_create(x_path::get_parent_dir_path(file_path).as_str());

    let mut file = match File::create(&file_path) {
        Ok(f) => f,
        Err(e) => {
            let eee = x_error::FileCreateError {
                path: file_path.to_owned(),
                error: e,
            };
            x_logger::log_error(&format!("write_str:: {}\n", eee));
            return Err(eee);
        }
    };

    match file.write_all(file_content.as_bytes()) {
        Ok(_) => return Ok(true),
        Err(e) => {
            let eee = x_error::FileWriteError {
                path: file_path.to_owned(),
                error: e,
            };
            x_logger::log_error(&format!("write_str:: {}\n", eee));
            return Err(eee);
        }
    }
}

pub fn write_bytes(file_path: &str, file_content: &Vec<u8>) -> Result<bool, x_error> {
    x_dir::check_or_create(x_path::get_parent_dir_path(&file_path).as_str());

    let mut file = match File::create(&file_path) {
        Ok(f) => f,
        Err(e) => {
            let eee = x_error::FileCreateError {
                path: file_path.to_owned(),
                error: e,
            };
            x_logger::log_error(&format!("write_bytes:: {}\n", eee));
            return Err(eee);
        }
    };

    match file.write_all(&file_content) {
        Ok(_) => {
            return Ok(true);
        }
        Err(e) => {
            let eee = x_error::FileWriteError {
                path: file_path.to_owned(),
                error: e,
            };
            x_logger::log_error(&format!("write_bytes:: {}\n", eee));
            return Err(eee);
        }
    }
}

pub fn write_base64_str(file_path: &str, file_content_base64: &str) -> bool {
    let file_content_string: String;

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

    match b64_STANDARD.decode(file_content_string) {
        Ok(d) => {
            match write_bytes(file_path, &d) {
                Ok(_) => return true,
                Err(_) => return false,
            };
        }
        Err(e) => {
            let eee = x_error::Base64DecodeError { error: e.clone() };
            x_logger::log_error(&format!("write_base64_str:: {}\n", eee));

            return false;
        }
    }
}

pub fn copy(path_str: &str, target_path_str: &str) -> bool {
    match fs::copy(path_str, target_path_str) {
        Ok(_) => return true,
        Err(_) => return false,
    }
}

pub fn delete(path_str: &str) -> bool {
    match fs::remove_file(path_str) {
        Ok(_) => return true,
        Err(_) => return false,
    }
}

pub fn exists(path_str: &str) -> bool {
    return Path::new(&path_str).exists();
}

pub fn get_modified_time_f64(entry: &DirEntry) -> f64 {
    let mmm = entry.metadata().unwrap();
    let modified = mmm.modified().unwrap();

    if let Ok(time) = modified.duration_since(SystemTime::UNIX_EPOCH) {
        return time.as_secs_f64();
    } else {
        return 0.0;
    }
}

pub fn add_head(file_path: &str, data: &Vec<u8>) -> Result<bool, x_error> {
    if data.len() == 0 {
        return Ok(true);
    }

    let temp_ptah = format!("{}.tmp", file_path);
    let mut tmp = match File::create(&temp_ptah) {
        Ok(f) => f,
        Err(e) => {
            let eee = x_error::FileCreateError {
                path: file_path.to_owned(),
                error: e,
            };
            x_logger::log_error(&format!("add_head:: {}\n", eee));
            return Err(eee);
        }
    };

    let mut src = match File::open(&file_path) {
        Ok(f) => f,
        Err(e) => {
            let eee = x_error::FileOpenError {
                path: file_path.to_owned(),
                error: e,
            };
            x_logger::log_error(&format!("add_head:: {}\n", eee));
            return Err(eee);
        }
    };

    match tmp.write_all(&data) {
        Ok(f) => f,
        Err(e) => {
            let eee = x_error::FileWriteError {
                path: temp_ptah.to_owned(),
                error: e,
            };
            x_logger::log_error(&format!("add_head:: {}\n", eee));
            return Err(eee);
        }
    };

    // Write the data to the beginning
    let copy = match io::copy(&mut src, &mut tmp) {
        Ok(_) => true,
        Err(e) => {
            let eee = x_error::FileCopyError {
                source_path: file_path.to_owned(),
                dist_path: temp_ptah.to_owned(),
                error: e,
            };
            x_logger::log_error(&format!("add_head:: {}\n", eee));
            return Err(eee);
        }
    };

    // Copy the rest of the source file
    let remove = match fs::remove_file(&file_path) {
        Ok(_) => true,
        Err(e) => {
            let eee = x_error::FileRemoveError {
                path: temp_ptah.to_owned(),
                error: e,
            };
            x_logger::log_error(&format!("add_head:: {}\n", eee));
            return Err(eee);
        }
    };

    let rename = match fs::rename(&temp_ptah, &file_path) {
        Ok(_) => true,
        Err(e) => {
            let eee = x_error::FileRenameError {
                path: temp_ptah.to_owned(),
                error: e,
            };
            x_logger::log_error(&format!("add_head:: {}\n", eee));
            return Err(eee);
        }
    };

    Ok(copy && remove && rename)
}

pub fn add_tail(file_path: &str, data: &Vec<u8>) -> Result<bool, x_error> {
    if data.len() == 0 {
        return Ok(true);
    }

    let mut file = match fs::OpenOptions::new().append(true).open(file_path) {
        Ok(f) => f,
        Err(e) => {
            let eee = x_error::FileOpenError {
                path: file_path.to_owned(),
                error: e,
            };
            x_logger::log_error(&format!("add_tail:: {}\n", eee));
            return Err(eee);
        }
    };

    match file.write_all(data) {
        Ok(res) => res,
        Err(e) => {
            let eee = x_error::FileWriteError {
                path: file_path.to_owned(),
                error: e,
            };
            x_logger::log_error(&format!("add_tail:: {}\n", eee));
            return Err(eee);
        }
    };

    Ok(true)
}

// Starting at `offset`, reads the `amount_to_read` from `reader`.
// Returns the bytes as a vector.
// Refer: https://stackoverflow.com/a/75378625/17217560
pub fn seek_read_by_buffer(
    reader: &mut (impl Read + io::Seek),
    offset: u64,
    buffer_size: usize,
) -> Result<Vec<u8>, std::io::Error> {
    // A buffer filled with as many zeros as we'll read with read_exact
    let mut buf = vec![0; buffer_size];
    reader.seek(SeekFrom::Start(offset))?;
    reader.read_exact(&mut buf)?;
    Ok(buf)
}
