use md5;
use sha2::{Digest, Sha256};
use std::{fs::File, io};

use crate::utils::logger as x_logger;

// Use sha2 crate to save memory, read file as stream, not read the entire file
pub fn sha256_by_file_path(file_path: &str) -> String {
    match File::open(file_path) {
        Ok(mut file) => {
            let mut hasher = Sha256::new();
            io::copy(&mut file, &mut hasher).unwrap();
            let hash = hasher.finalize();
            let fh = format!("{:x}", hash);
            return fh;
        }
        Err(e) => {
            x_logger::log_error(&format!(
                ">>> sha256_by_file_path open file({}) error: {}\n",
                &file_path, e
            ));
            return "".to_string();
        }
    }
}

pub fn sha256_by_bytes(data: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data);
    let hash = hasher.finalize();
    let fh = format!("{:x}", hash);
    return fh;
}

pub fn crc32_by_bytes(bys: &[u8]) -> u32 {
    return crc32fast::hash(bys);
}

pub fn md5_bytes(input: &str) -> [u8; 16] {
    return *md5::compute(input);
}
