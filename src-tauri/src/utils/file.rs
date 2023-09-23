use serde::{Deserialize, Serialize};
use xutils::{file as xu_file, hash as xu_hash};

#[derive(Serialize, Deserialize, Debug)]
pub struct FileMeta {
    sha256: String,
    size: usize,
}

impl FileMeta {
    pub fn new() -> Self {
        FileMeta {
            sha256: "".to_owned(),
            size: 0,
        }
    }
}

pub fn get_file_meta(file_path: &str) -> FileMeta {
    let mut res = FileMeta::new();
    res.sha256 = xu_hash::sha256_by_file_path(file_path);
    res.size = xu_file::get_size(file_path) as usize;

    res
}
