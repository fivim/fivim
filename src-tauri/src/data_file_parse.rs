use serde::{Deserialize, Serialize};
use std::io;

use crate::conf as x_conf;
use crate::utils::encrypt as x_encrypt;
use crate::utils::file as x_file;
use crate::utils::hash as x_hash;

#[derive(Serialize, Deserialize, Debug)]
pub struct UserFileData {
    crc32: i32,
    file_modify_timestamp: i64,
    file_name: String,
    file_data: Vec<u8>,
    file_data_str: String,
}

impl UserFileData {
    pub fn new() -> Self {
        return UserFileData {
            crc32: 0,
            file_modify_timestamp: 0,
            file_name: "".to_owned(),
            file_data: [].to_vec(),
            file_data_str: "".to_owned(),
        };
    }
}

pub fn deserialize(bytes: Vec<u8>) -> UserFileData {
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

    // TODO check File header signature
    // TODO check Item header signature

    // Item file name
    let _file_name_length = i16::from_le_bytes(item_file_name_length);
    let _file_name_end = 76 + _file_name_length as usize;
    let item_file_name = &bytes[76.._file_name_end];

    // Item file data
    let _file_data_length_end = _file_name_end + 4 as usize;
    item_file_data_length[..].clone_from_slice(&bytes[_file_name_end.._file_data_length_end]);
    let _file_data_end = _file_data_length_end + i32::from_le_bytes(item_file_data_length) as usize;
    let item_file_data = &bytes[_file_name_end + 4.._file_data_end];

    // TODO check Item file Tail

    res.file_name = String::from_utf8(item_file_name.to_vec()).unwrap();
    res.file_data = item_file_data.to_vec();
    res.crc32 = i32::from_le_bytes(item_crc32);
    res.file_modify_timestamp = i64::from_le_bytes(file_modify_timestamp);

    return res;
}

pub fn deserialize_string(pwd: &str, bytes: &Vec<u8>) -> String {
    let fd = deserialize(bytes.to_vec());
    return x_encrypt::decrypt_bytes(&pwd, &fd.file_data);
}

fn serialize_meta(file_name: &str) -> [Vec<u8>; 3] {
    let file_name_arr = file_name.as_bytes();
    let fnu = &file_name_bytes(&file_name_arr).to_vec();
    let tmu = &timestamp_bytes().to_vec();
    let pk = "PK".as_bytes().to_vec();

    // File header
    let mut file_header = [0u8; 30];
    file_header[0..12].clone_from_slice(
        &[
            pk[0], pk[1], 3, 4, // File header signature
            0, 1, // File structure version
            0, 1, // Inner data structure version
            0, 0, 0, 0, // CRC-32
        ]
        .to_vec(),
    );
    file_header[12..20].clone_from_slice(tmu); // File last modification UTC timestamp

    // Item header
    let mut item_header_basic = [0u8; 46];
    item_header_basic[0..8].clone_from_slice(
        &[
            pk[0], pk[1], 1, 2, // Item header signature
            0, 0, 0, 0, // CRC-32, update later
        ]
        .to_vec(),
    );
    item_header_basic[8..16].clone_from_slice(tmu); // Item last modification UTC timestamp
    item_header_basic[16..18].clone_from_slice(fnu); // Item file name length
    let item_header = [item_header_basic.to_vec(), file_name_arr.to_vec()].concat();

    // Item tail
    let mut item_tail = [0u8; 22];
    item_tail[0..4].clone_from_slice(
        &[
            pk[0], pk[1], 5, 6, // End of item signature
        ]
        .to_vec(),
    );

    return [file_header.to_vec(), item_header, item_tail.to_vec()];
}

fn serialize_small_file_bytes(pwd: &str, file_name: &str, file_content: Vec<u8>) -> Vec<u8> {
    let [file_header, mut item_header, item_tail] = serialize_meta(file_name);

    // Update crc32(sha256)
    let data = x_encrypt::encrypt_bytes(&pwd, &file_content); //Item file data
    let crc32 = sha256_crc32_bytes(x_hash::sha256_by_bytes(&data).as_bytes());
    item_header[4..8].clone_from_slice(&crc32.to_vec()); // Item CRC-32

    // Merge most of the data.
    let content_final = [
        // File header
        file_header.to_vec(),
        // Item file header
        item_header.to_vec(),
        // Item file body
        size_bytes(data.len()).to_vec(), // Item file data length
        data.to_vec(),                   // Item file data
        // Item file tail
        item_tail.to_vec(),
    ]
    .concat();

    return content_final;
}

fn serialize_large_file_bytes(pwd: &str, file_name: &str, source_of_large_file_path: &str) {
    print!("Unsupport large file");
    // TODO
    // Item file data length
    // Item file data
    // part_item_tail
}

pub fn read_file(pwd: &str, file_path: &str, parse_as_string: bool) -> UserFileData {
    let size = x_file::file_size(&file_path);
    let empty = UserFileData::new();
    if size <= x_conf::LARGE_FILE_SIZE {
        // small file, read all the content
        match x_file::read_file_to_bytes(&file_path) {
            Ok(content) => {
                let mut d = deserialize(content);
                if parse_as_string {
                    d.file_data_str = x_encrypt::decrypt_bytes(pwd, &d.file_data);
                }
                return d;
            }
            Err(e) => {
                print!(
                    ">>> read_file read_file_to_bytes path: {} , error: {:?} \n",
                    &file_path, e
                );
                return empty;
            }
        };
    } else {
        // latge file, use buffer for saving memory.
        print!("Unsupport large file \n");
    }

    return empty;
}

/// Write user data to file
///
/// If **source_of_large_file_path** is passed, it will be treated as a large file, or it will be treated as a small file.
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
) -> Result<bool, io::Error> {
    if source_of_large_file_path == "" {
        // write as small file
        let content = serialize_small_file_bytes(pwd, file_name, file_content);
        return x_file::write_bytes_into_file(file_path, &content);
    } else {
        // write as large file
        serialize_large_file_bytes(pwd, file_name, source_of_large_file_path);
    }

    Ok(true)
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

fn sha256_crc32_bytes(sha256: &[u8]) -> [u8; 4] {
    let crc32 = x_hash::crc32_by_bytes(sha256);
    return crc32.to_le_bytes();
}

pub fn test() {
    let pwd = "pwd";
    let bytes_enc =
        serialize_small_file_bytes(pwd, "file_name", "file_content".as_bytes().to_vec());
    print!(">>> file content bytes : {:?}\n", bytes_enc);

    let dec = deserialize_string(pwd, &bytes_enc);
    print!(">>> file content string : {}\n", dec);
}
