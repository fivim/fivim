use xencrypt::chacha20poly1305::{
    decrypt_large_file, decrypt_u8_arr, encrypt_large_file, encrypt_u8_arr,
};

use crate::utils::logger as x_logger;
use crate::utils::{array_like, hash};

const SIZE_KEY: usize = 32;
const SIZE_NONCE_LARGE: usize = 19;
const SIZE_NONCE_SMALL: usize = 24;

// Convert a slice as an array
// Refer: https://stackoverflow.com/questions/25428920/how-to-get-a-slice-as-an-array-in-rust
fn u8_array_key(input: &[u8]) -> [u8; SIZE_KEY] {
    input.try_into().expect("slice with incorrect length")
}

fn u8_array_nonce_large(input: &[u8]) -> [u8; SIZE_NONCE_LARGE] {
    input.try_into().expect("slice with incorrect length")
}

fn u8_array_nonce_small(input: &[u8]) -> [u8; SIZE_NONCE_SMALL] {
    input.try_into().expect("slice with incorrect length")
}

pub fn gen_key(pwd: &str) -> [u8; SIZE_KEY] {
    let binding = array_like::fill_arr_u8(pwd.as_bytes(), SIZE_KEY);

    return u8_array_key(binding.as_slice());
}

pub fn gen_nonce_large(pwd: &str) -> [u8; SIZE_NONCE_LARGE] {
    let md5 = hash::md5_bytes(pwd);
    let binding = array_like::fill_arr_u8(&md5, SIZE_NONCE_LARGE);
    return u8_array_nonce_large(binding.as_slice());
}

pub fn gen_nonce_small(pwd: &str) -> [u8; SIZE_NONCE_SMALL] {
    let md5 = hash::md5_bytes(pwd);
    let binding = array_like::fill_arr_u8(&md5, SIZE_NONCE_SMALL);
    return u8_array_nonce_small(binding.as_slice());
}

pub fn encrypt_file(
    pwd: &str,
    source_path: &str,
    dist_path: &str,
    file_header: &[u8],
    file_tail: &[u8],
) -> bool {
    match encrypt_large_file(
        source_path,
        dist_path,
        &gen_key(pwd),
        &gen_nonce_large(pwd),
        file_header,
        file_tail,
    ) {
        Ok(_) => return true,
        Err(e) => {
            x_logger::log_error(&format!(">>> encrypt_file error: {:?} \n", e));
            return false;
        }
    }
}

pub fn decrypt_file(pwd: &str, source_path: &str, dist_path: &str) -> bool {
    match decrypt_large_file(source_path, dist_path, &gen_key(pwd), &gen_nonce_large(pwd)) {
        Ok(_) => return true,
        Err(e) => {
            x_logger::log_error(&format!(">>> decrypt_file error: {:?} \n", e));
            return false;
        }
    }
}

pub fn encrypt_bytes(pwd: &str, content: &[u8]) -> Vec<u8> {
    match encrypt_u8_arr(&content.to_vec(), &gen_key(pwd), &gen_nonce_small(pwd)) {
        Ok(vu8) => return vu8,
        Err(_) => return vec![],
    }
}

pub fn decrypt_bytes(pwd: &str, content: &Vec<u8>) -> String {
    let dec = match decrypt_u8_arr(&content, &gen_key(pwd), &gen_nonce_small(pwd)) {
        Ok(vu8) => vu8,
        Err(_) => vec![],
    };
    if dec.len() == 0 {
        return "".to_string();
    }

    match String::from_utf8(dec) {
        Ok(d) => return d,
        Err(e) => {
            x_logger::log_error(&format!(">>> decrypt_string error: {:?} \n", e));
            return "".to_string();
        }
    }
}

pub fn test_encrypt_decrypt_string() {
    let pwd = "Here is the password";
    let encrypted_data = [
        9, 234, 70, 225, 215, 42, 119, 78, 55, 208, 30, 9, 192, 162, 125, 117, 137, 202, 249, 142,
        12, 253, 212, 103, 135, 116, 147, 67, 124, 191, 81, 196, 84, 186, 37, 191, 169, 29, 124,
        84, 191, 87,
    ];
    let enc = encrypt_bytes(pwd, "Here is the string content".as_bytes());
    print!(">>> after encrypt: {:?} \n", enc);

    let dec = decrypt_bytes(pwd, &encrypted_data.to_vec());
    print!(">>> after decrypt: {:?} \n", dec);
}
