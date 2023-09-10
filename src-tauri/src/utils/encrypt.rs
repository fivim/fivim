use xencrypt::xchacha20poly1305::{
    decrypt as xu_decrypt, encrypt as xu_encrypt, re_encrypt_file as xu_re_encrypt_file, EncryptRes, SIZE_KEY, SIZE_NONCE,
};

use xutils::{
    array_like as xu_array, errors::EaError as xu_error, hash as xu_hash,
    logger as xu_logger, string as xu_string,
};

// Convert a slice as an array
// Refer: https://stackoverflow.com/questions/25428920/how-to-get-a-slice-as-an-array-in-rust
fn u8_array_key(input: &[u8]) -> [u8; SIZE_KEY] {
    input.try_into().expect("slice with incorrect length")
}

fn u8_array_nonce(input: &[u8]) -> [u8; SIZE_NONCE] {
    input.try_into().expect("slice with incorrect length")
}

pub fn gen_key(pwd: &str) -> [u8; SIZE_KEY] {
    let binding = xu_array::fill_arr_u8(pwd.as_bytes(), SIZE_KEY, true);

    return u8_array_key(binding.as_slice());
}

pub fn gen_nonce(pwd: &str) -> [u8; SIZE_NONCE] {
    let md5 = xu_hash::md5_bytes(pwd); // TODO too short
    let binding = xu_array::fill_arr_u8(&md5, SIZE_NONCE, true);
    return u8_array_nonce(binding.as_slice());
}

pub fn encrypt_bytes(pwd: &str, content: &Vec<u8>, progress_name: &str) -> Vec<u8> {
    let kkk = gen_key(pwd);
    let nnn = gen_nonce(pwd);

    match xu_encrypt(
        &kkk,
        &nnn,
        content,
        "".to_string(),
        "".to_string(),
        &[].to_vec(),
        &[].to_vec(),
        progress_name.to_owned(),
    ) {
        Ok(d) => {
            d.dist_vec
        }
        Err(e) => {
            xu_logger::log_error(&format!("encrypt_bytes error:{:?}\n", e));
            vec![]
        }
    }
}

pub fn decrypt_bytes(pwd: &str, content: &Vec<u8>, progress_name: &str) -> Vec<u8> {
    let kkk = gen_key(pwd);
    let nnn = gen_nonce(pwd);

    match xu_decrypt(
        &kkk,
        &nnn,
        content,
        "".to_string(),
        "".to_string(),
        0,
        0,
        progress_name.to_owned(),
    ) {
        Ok(de) => de.dist_vec,
        Err(e) => {
            xu_logger::log_error(&format!("decrypt_bytes error:{:?}\n", e));
            [].to_vec()
        }
    }
}

pub fn decrypt_bytes_to_string(pwd: &str, content: &Vec<u8>, progress_name: &str) -> String {
    let dec = decrypt_bytes(pwd, content, progress_name);
    xu_string::bytes_to_string(&dec)
}

pub fn encrypt_file(
    pwd: &str,
    source_path: &str,
    dist_path: &str,
    progress_name: &str,
) -> EncryptRes {
    let kkk = gen_key(pwd);
    let nnn = gen_nonce(pwd);

    match xu_encrypt(
        &kkk,
        &nnn,
        &[].to_vec(),
        source_path.to_owned(),
        dist_path.to_owned(),
        &[].to_vec(),
        &[].to_vec(),
        progress_name.to_string(),
    ) {
        Ok(d) => d,
        Err(e) => {
            let eee = xu_error::EncryptFileError {
                path: source_path.to_owned(),
                error: e,
            };
            xu_logger::log_error(&format!("encrypt_file:: error: {}\n", eee));

            
            EncryptRes {
                dist_vec: [].to_vec(),
                encrypted_data_len: 0,
            }
        }
    }
}

pub fn decrypt_file(
    pwd: &str,
    source_path: &str,
    dist_path: &str,
    start: usize,
    end: usize,
    progress_name: &str,
) -> EncryptRes {
    let kkk = gen_key(pwd);
    let nnn = gen_nonce(pwd);

    // TODO

    match xu_decrypt(
        &kkk,
        &nnn,
        &[].to_vec(),
        source_path.to_owned(),
        dist_path.to_owned(),
        start,
        end,
        progress_name.to_string(),
    ) {
        Ok(d) => d,
        Err(e) => {
            let eee = xu_error::DecryptFileError {
                path: source_path.to_owned(),
                error: e,
            };
            xu_logger::log_error(&format!("decrypt_file:: error: {}\n", eee));

            
            EncryptRes {
                dist_vec: [].to_vec(),
                encrypted_data_len: 0,
            }
        }
    }
}

pub fn re_encrypt_file(
    pwd: &str,
    pwd_new: &str,
    source_path: &str,
    dist_path: &str,
    start: usize,
    end: usize,
    progress_name: &str,
) -> usize {
    let kkk = gen_key(pwd);
    let nnn = gen_nonce(pwd);

    let kkk_new = gen_key(pwd_new);
    let nnn_new = gen_nonce(pwd_new);

    match xu_re_encrypt_file(
        &kkk,
        &nnn,
        &kkk_new,
        &nnn_new,
        source_path,
        start,
        end,
        dist_path,
        &[].to_vec(),
        &[].to_vec(),
        progress_name.to_string(),
    ) {
        Ok(d) => d,
        Err(e) => {
            let eee = xu_error::ReEncryptFileError {
                source_path: source_path.to_owned(),
                dist_path: dist_path.to_owned(),
                error: e,
            };
            xu_logger::log_error(&format!("re_encrypt_file:: error: {}\n", eee));

            0
        }
    }
}

#[test]
pub fn test() {
    use xencrypt::xchacha20poly1305::{
        test_file,
        test_string,
    };
    let text = "vfE6IJRRnUCAzNqGHqFCdJ4bFQk4wqeKtQ5RXv5wyVQEaIZsj8Sic2L8Eze5DyN7GFMqAAnaRUBpqhposu4LHj1ZkGDJsgcv80AH3SOD0AlZ5arzfzL03T0J7UVS14xDgRKdVfhIxl2ZKEMZpAbSAtzD08r3D5sR4f41q9rnj9DZ91o8Yl9QPp3VkQ5GU2DfvjNwgwan8D3lXm9WK5yuJTGkwX8L3VBayPJuuCyAZhTwndnx2aRuKxZ04794sL7rX8B1ZBtjsPkFHqWheDSC3ARpqIi8P5yz0kCvGzUpwH5uubIANqIPUegSWZYJrJX94C9Tkp6Kx0LYcHAtY5hPJ4xqKWZ65XL7DFKIkkFK8uv1H3VsrBmBBrFcpauyR1KbimXHT6RkoeceQrKwPX7yhbI3216192B63q4TYYndAOVrTfMqxvqxBxjn9u994JfOHulFSYvQrZH5odfadoJzKseHZyrp487IhN9z51gFi6uNVB74d62";
    test_string(text);

    let source_path = r#"C:\Users\xxx\Desktop\test_enassi\1test.png"#;
    let enc_dist_path = r#"C:\Users\xxx\Desktop\test_enassi\2test.enc"#;
    let dec_dist_path = r#"C:\Users\xxx\Desktop\test_enassi\3dec.png"#;
    let header = [1, 2, 3].to_vec();
    let tail = [9, 8, 7].to_vec();
    // let header = [].to_vec();
    // let tail = [].to_vec();
    test_file(source_path, enc_dist_path, dec_dist_path, &header, &tail);

    println!("check file \n\n")
}
