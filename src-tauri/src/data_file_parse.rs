use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::Read;

use base64::engine::{general_purpose::STANDARD as b64_STANDARD, Engine};
use xutils::{
    errors::EaError as xu_error, file as xu_file, hash as xu_hash, logger as xu_logger,
    sys as xu_sys,
};

use crate::conf as x_conf;
use crate::utils::encrypt as x_encrypt;

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
        file_size_kb = xu_file::get_size(file_path) / 1024;
    }

    let mem_state = xu_sys::get_memory_info();
    return mem_state.free > file_size_kb * 10;
}

fn get_file_meta(file_path: &str) -> UserFileData {
    let res = UserFileData::new();
    let mut buffer = [0u8; FILE_HEADER_SIZE + ITEM_HEADER_SIZE];
    let mut file = match File::open(file_path) {
        Ok(f) => f,
        Err(e) => {
            let eee = xu_error::FileOpenError {
                path: file_path.to_owned(),
                error: e,
            };
            xu_logger::log_error(&format!("read_file:: {}\n", eee));
            return res;
        }
    };
    let read_count = match file.read(&mut buffer) {
        Ok(f) => f,
        Err(e) => {
            let eee = xu_error::FileReadError {
                path: file_path.to_owned(),
                error: e,
            };
            xu_logger::log_error(&format!("read_file:: {}\n", eee));
            return res;
        }
    };

    if read_count != ITEM_BODY_START {
        xu_logger::log_error("read_file get file meta count not match \n");
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
    res.crc32_check = xu_hash::crc32_of_sha256_by_data(&item_file_data);

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

// Read and decrypt user data
pub fn read_file(
    pwd: &str,
    file_path: &str,
    always_open_in_memory: bool,
    parse_as: &str,
    target_file_path: &str,
    progress_name: &str,
) -> Result<UserFileData, xu_error> {
    let meta = get_file_meta(file_path);
    let file_size_kb: usize = (meta.file_data_len / 1024).try_into().unwrap();

    if always_open_in_memory || do_in_memory(file_size_kb as u64, file_path) {
        // small file, read all the content
        // TODO read file twice
        match xu_file::read_to_bytes(&file_path, false) {
            Ok(content) => {
                let mut psd = parse_small_data(&content);
                let bin = x_encrypt::decrypt_bytes(pwd, &psd.file_data, &progress_name);

                // parse data
                if parse_as == x_conf::TYPE_STRING {
                    psd.file_data_str =
                        x_encrypt::decrypt_bytes_to_string(pwd, &psd.file_data, &progress_name);
                } else {
                    if parse_as == x_conf::TYPE_BASE64 {
                        psd.file_data_str = b64_STANDARD.encode(&bin);
                    } else if parse_as == x_conf::TYPE_BINARY {
                        psd.file_data = (&*bin).to_vec();
                    }
                }

                if target_file_path != "" {
                    match xu_file::write_bytes(target_file_path, &bin) {
                        Ok(_) => (),
                        Err(e) => return Err(e),
                    }
                }
                return Ok(psd);
            }
            Err(e) => {
                xu_logger::log_error(&format!(
                    "read_file read_to_bytes error: {:?}, path: {}\n",
                    e, &file_path
                ));
                return Ok(meta);
            }
        };
    } else {
        // latge file, use a temp file for saving memory.

        if target_file_path == "" {
            xu_logger::log_error(
                "read_file with a large file should pass target_file_path param \n",
            );
            // TODO
            // Err(("read_file with a large file should pass target_file_path param"))
        }

        x_encrypt::decrypt_file(
            pwd,
            file_path,
            target_file_path,
            meta.file_data_start_pos,
            meta.file_data_end_pos,
            &progress_name,
        );
    }

    Ok(meta)
}

/// Encrypt and write user data to file
///
/// large_file_source_path is the large file source path, only used when encrypt large file.
/// If large_file_source_path is not empty, it will be treated as a large file.
///
/// For small file, pass file_name / file_path / file_content
/// For large file, pass file_name / file_path / large_file_source_path
///
pub fn write_file(
    pwd: &str,
    dist_path: &str,
    file_name: &str,
    vec_data: Vec<u8>,
    large_file_source_path: &str,
    progress_name: &str,
) -> Result<bool, xu_error> {
    // First encrypt the file directly.
    // If the file is not too large, operate directly in memory,
    // otherwise write to a temporary file, then assemble the full data.

    if large_file_source_path == "" {
        // Operate all data in memory.
        let enc_data = x_encrypt::encrypt_bytes(pwd, &vec_data, &progress_name);
        let [header, item_tail] =
            gen_file_meta(file_name, sha256_crc32_bytes(&enc_data), enc_data.len());
        let res = [header, enc_data, item_tail.to_vec()].concat();

        return xu_file::write_bytes(dist_path, &res);
    } else {
        // The encrypted data will first be written to a temporary file.
        // After calculating the crc32 and length, and then combined into a complete file.

        // TODO Maybe we can write all the data first, and finally modify the crc32 and length.

        let enc_data =
            x_encrypt::encrypt_file(pwd, large_file_source_path, dist_path, &progress_name);
        if enc_data.encrypted_data_len > 0 {
            let crc32 = sha256_crc32_file_path(large_file_source_path);
            let [header, tail] = gen_file_meta(file_name, crc32, enc_data.encrypted_data_len);

            xu_file::add_head(dist_path, &header)?;
            xu_file::add_tail(dist_path, &tail.to_vec())?;
        }
    }

    Ok(true)
}

// Re-encrypt files
pub fn re_encrypt_file(
    pwd: &str,
    new_pwd: &str,
    file_path: &str,
    file_name: &str,
    target_file_path: &str,
    progress_name: &str,
) -> Result<bool, xu_error> {
    let meta = get_file_meta(file_path);

    let rel = x_encrypt::re_encrypt_file(
        pwd,
        new_pwd,
        file_path,
        target_file_path,
        meta.file_data_start_pos,
        meta.file_data_end_pos,
        &progress_name,
    );

    if rel > 0 {
        let crc32 = sha256_crc32_file_path(target_file_path);
        let [header, tail] = gen_file_meta(file_name, crc32, rel);

        xu_file::add_head(target_file_path, &header)?;
        xu_file::add_tail(target_file_path, &tail.to_vec())?;

        return Ok(true);
    }

    Ok(false)
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
    let crc32 = xu_hash::crc32_of_sha256_by_data(data);
    return crc32.to_le_bytes();
}

fn sha256_crc32_file_path(dist_path: &str) -> [u8; 4] {
    let crc32 = xu_hash::crc32_of_sha256_by_file_path(dist_path);
    return crc32.to_le_bytes();
}
