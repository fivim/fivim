use serde::{Deserialize, Serialize};
use std::fs;
use std::fs::File;
use std::io::Read;
use std::io::Write;

use base64::engine::{general_purpose::STANDARD as b_STANDARD, Engine as b_Engine};

use xencrypt::xchacha20poly1305::{decrypt, encrypt};

use crate::utils::encrypt as x_encrypt;
use xutils::errors::EaError as x_error;
use xutils::file as x_file;
use xutils::hash as x_hash;
use xutils::logger as x_logger;
use xutils::sys as x_sys;

#[derive(Serialize, Deserialize, Debug)]
pub struct UserFileData {
    crc32: u32,
    crc32_check: u32,
    file_modify_timestamp: i64,
    file_name: String,
    file_data: Vec<u8>,
    file_data_str: String,
    // rust use
    file_name_start_pos: usize,
    file_name_end_pos: usize,
    file_name_len: usize,
    file_data_start_pos: usize,
    file_data_end_pos: usize,
    file_data_len: i32,
}

impl UserFileData {
    pub fn new() -> Self {
        return UserFileData {
            crc32: 0,
            crc32_check: 0,
            file_modify_timestamp: 0,
            file_name: "".to_owned(),
            file_data: [].to_vec(),
            file_data_str: "".to_owned(),
            //
            file_name_start_pos: 0,
            file_name_end_pos: 0,
            file_name_len: 0,
            file_data_start_pos: 0,
            file_data_end_pos: 0,
            file_data_len: 0,
        };
    }
}

const FILE_HEADER_SIZE: usize = 30;
const ITEM_HEADER_SIZE: usize = 50;
const ITEM_BODY_START: usize = 80; // FILE_HEADER_SIZE + ITEM_BODY_START;
const ITEM_TAIL_SIZE: usize = 20;

fn do_in_memory(mut file_size_kb: u64, file_path: &str) -> bool {
    if file_size_kb == 0 {
        file_size_kb = x_file::get_size(file_path) / 1024;
    }

    let mem_state = x_sys::get_memory_info();
    return mem_state.free > file_size_kb * 20;
}

fn get_file_meta(file_path: &str) -> UserFileData {
    let res = UserFileData::new();
    let mut buffer = [0u8; FILE_HEADER_SIZE + ITEM_HEADER_SIZE];
    let mut file = match File::open(file_path) {
        Ok(f) => f,
        Err(e) => {
            let eee = x_error::FileOpenError {
                path: file_path.to_owned(),
                error: e,
            };
            x_logger::log_error(&format!("read_file:: {}\n", eee));
            return res;
        }
    };
    let read_count = match file.read(&mut buffer) {
        Ok(f) => f,
        Err(e) => {
            let eee = x_error::FileReadError {
                path: file_path.to_owned(),
                error: e,
            };
            x_logger::log_error(&format!("read_file:: {}\n", eee));
            return res;
        }
    };

    if read_count != ITEM_BODY_START {
        x_logger::log_error("read_file get file meta count not match \n");
    }

    let bytes = buffer.to_vec();
    let meta = decode_file_meta(&bytes);

    return meta;
}

fn decode_file_meta(bytes: &Vec<u8>) -> UserFileData {
    let mut res = UserFileData::new();

    let mut file_header_signature = [0u8; 4];
    let mut file_modify_timestamp = [0u8; 8];
    let mut item_header_signature = [0u8; 4];
    let mut item_crc32 = [0u8; 4];
    let mut item_modify_timestamp = [0u8; 8];
    let mut item_file_name_length = [0u8; 2];
    let mut item_file_data_length = [0u8; 4];

    // File and item header
    file_header_signature[..].clone_from_slice(&bytes[0..4]);
    file_modify_timestamp[..].clone_from_slice(&bytes[12..20]);
    item_header_signature[..].clone_from_slice(&bytes[30..34]);
    item_crc32[..].clone_from_slice(&bytes[34..38]);
    item_modify_timestamp[..].clone_from_slice(&bytes[38..46]);
    item_file_name_length[..].clone_from_slice(&bytes[46..48]);
    item_file_data_length[..].clone_from_slice(&bytes[48..52]);

    // Item file name info
    let file_name_len = i16::from_le_bytes(item_file_name_length);
    let file_name_start = ITEM_BODY_START;
    let file_name_end = file_name_start + file_name_len as usize;

    // Item file data info
    let file_data_len = i32::from_le_bytes(item_file_data_length);
    let file_data_start = file_name_end;
    let file_data_end = file_data_start + file_data_len as usize;

    // TODO check File header signature
    // TODO check Item header signature
    // TODO check Item file Tail

    res.crc32 = u32::from_le_bytes(item_crc32);
    res.file_modify_timestamp = i64::from_le_bytes(file_modify_timestamp);

    res.file_name_start_pos = file_name_start;
    res.file_name_end_pos = file_name_end;
    res.file_name_len = file_name_len as usize;

    res.file_data_start_pos = file_data_start;
    res.file_data_end_pos = file_data_end;
    res.file_data_len = file_data_len;

    return res;
}

pub fn parse_small_data(bytes: &Vec<u8>) -> UserFileData {
    let mut res = decode_file_meta(bytes);
    let item_file_name = &bytes[res.file_name_start_pos..res.file_name_end_pos];
    let item_file_data = &bytes[res.file_data_start_pos..res.file_data_end_pos];

    res.file_name = String::from_utf8(item_file_name.to_vec()).unwrap();
    res.file_data = item_file_data.to_vec();
    res.crc32_check = x_hash::crc32_of_sha256_by_data(&item_file_data);

    return res;
}

fn gen_file_meta(file_name: &str, crc32: [u8; 4], data_len: usize) -> [Vec<u8>; 2] {
    let file_name_arr = file_name.as_bytes();
    let fnu = &file_name_bytes(&file_name_arr).to_vec();
    let tmu = &timestamp_bytes().to_vec();
    let pk = "PK".as_bytes().to_vec();
    let data_size = &size_bytes(data_len);

    // File header
    let mut file_header = [0u8; FILE_HEADER_SIZE];
    file_header[0..12].clone_from_slice(
        &[
            pk[0], pk[1], 3, 4, // File header signature
            0, 2, // File format version
            0, 2, // Inner data structure version
            0, 0, 0, 0, // CRC-32
        ]
        .to_vec(),
    );
    file_header[12..20].clone_from_slice(tmu); // File last modification UTC timestamp

    // Item header
    let mut item_header = [0u8; ITEM_HEADER_SIZE];
    item_header[0..4].clone_from_slice(&[pk[0], pk[1], 1, 2].to_vec()); // Item header signature
    item_header[4..8].clone_from_slice(&crc32.to_vec()); // Item CRC-32
    item_header[8..16].clone_from_slice(tmu); // Item last modification UTC timestamp
    item_header[16..18].clone_from_slice(fnu); // Item file name length
    item_header[18..22].clone_from_slice(data_size); // Item file data length

    // Item tail
    let mut item_tail = [0u8; ITEM_TAIL_SIZE];
    item_tail[0..4].clone_from_slice(
        &[
            pk[0], pk[1], 5, 6, // End of item signature
        ]
        .to_vec(),
    );

    let header = [
        file_header.to_vec(),
        item_header.to_vec(),
        file_name_arr.to_vec(),
    ]
    .concat();

    return [header, item_tail.to_vec()];
}

fn encrypt_data_to_file(
    pwd: &str,
    source_path: &str,
    dist_path: &str,
    file_name: &str,
    mut file_data: Vec<u8>,
) -> Result<bool, x_error> {
    // First encrypt the file directly.
    // If the file is not too large, operate directly in memory,
    // otherwise write to a temporary file, then assemble the full data.

    if file_data.len() == 0 && source_path != "" {
        file_data = match x_file::read_to_bytes(source_path) {
            Ok(data) => data,
            Err(e) => return Err(e),
        };
    } else {
        // TODO error
    }

    if do_in_memory(0, source_path) {
        // The file is not too large.
        // Operate all data in memory.

        let enc_data = x_encrypt::encrypt_bytes(pwd, &file_data);
        let [header, item_tail] =
            gen_file_meta(file_name, sha256_crc32_bytes(&enc_data), enc_data.len());
        let res = [header, enc_data, item_tail.to_vec()].concat();

        return x_file::write_bytes(dist_path, &res);
    } else {
        // The file is too large.
        // The encrypted data will first be written to a temporary file.
        // After calculating the crc32 and length, and then combined into a complete file.

        let enc_data = x_encrypt::encrypt_file(pwd, source_path, dist_path);
        if enc_data.encrypted_data_len > 0 {
            let [header, tail] = gen_file_meta(
                file_name,
                sha256_crc32_file_path(source_path),
                enc_data.encrypted_data_len,
            );

            x_file::add_head(dist_path, &header)?;
            x_file::add_tail(dist_path, &tail.to_vec())?;
        }
    }

    Ok(true)
}

// Read and decrypt user data
pub fn read_file(
    pwd: &str,
    file_path: &str,
    always_open_in_memory: bool,
    parse_as: &str,
    target_file_path: &str,
) -> Result<UserFileData, x_error> {
    let meta = get_file_meta(file_path);
    let file_size_kb: usize = (meta.file_data_len / 1024).try_into().unwrap();
    if always_open_in_memory || do_in_memory(file_size_kb as u64, file_path) {
        // small file, read all the content
        // TODO read file twice
        match x_file::read_to_bytes(&file_path) {
            Ok(content) => {
                let mut d = parse_small_data(&content);
                // parse data
                if parse_as == "string" {
                    d.file_data_str = x_encrypt::decrypt_bytes_to_string(pwd, &d.file_data);
                } else {
                    let bin = x_encrypt::decrypt_bytes(pwd, &d.file_data);

                    if parse_as == "base64" {
                        let egggg = &b_STANDARD;
                        d.file_data_str = egggg.encode(bin);
                    } else {
                        d.file_data = bin;
                    }
                }
                if target_file_path != "" {
                    match x_file::write_bytes(target_file_path, &d.file_data) {
                        Ok(_) => (),
                        Err(e) => return Err(e),
                    }
                }
                return Ok(d);
            }
            Err(e) => {
                x_logger::log_error(&format!(
                    "read_file read_file_to_bytes error: {:?}, path: {}\n",
                    e, &file_path
                ));
                return Ok(meta);
            }
        };
    } else {
        // latge file, use a temp file for saving memory.

        if target_file_path == "" {
            x_logger::log_error(
                "read_file with a large file should pass target_file_path param \n",
            );
            // TODO
            // Err(("read_file with a large file should pass target_file_path param"))
        }

        let dec = x_encrypt::decrypt_file(
            pwd,
            file_path,
            target_file_path,
            meta.file_data_start_pos,
            meta.file_data_end_pos,
        );
    }

    Ok(meta)
}

/// Encrypt and write user data to file
///
/// If source_of_large_file_path is not empty, it will be treated as a large file.
///
/// For small file, pass file_name / file_path / file_content
/// For large file, pass file_name / file_path / source_of_large_file_path
///
pub fn write_file(
    pwd: &str,
    file_path: &str,
    file_name: &str,
    file_content: Vec<u8>,
    source_of_large_file_path: &str,
) -> Result<bool, x_error> {
    return encrypt_data_to_file(
        pwd,
        source_of_large_file_path,
        file_path,
        file_name,
        file_content,
    );
}

pub fn timestamp_bytes() -> [u8; 8] {
    let tm = chrono::offset::Utc::now().timestamp();
    return tm.to_le_bytes();
}

fn file_name_bytes(file_name_arr: &[u8]) -> [u8; 2] {
    let fnl = file_name_arr.len() as i16; // Max 32767
    return fnl.to_le_bytes();
}

fn size_bytes(size: usize) -> [u8; 4] {
    let sz = size as i32; // Max 2147483647
    return sz.to_le_bytes();
}

fn sha256_crc32_bytes(data: &[u8]) -> [u8; 4] {
    let crc32 = x_hash::crc32_of_sha256_by_data(data);
    return crc32.to_le_bytes();
}

fn sha256_crc32_file_path(dist_path: &str) -> [u8; 4] {
    let crc32 = x_hash::crc32_of_sha256_by_file_path(dist_path);
    return crc32.to_le_bytes();
}