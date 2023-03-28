use xencrypt::xchacha20poly1305::{
    decrypt, encrypt, test_file, test_string, EncryptRes, SIZE_KEY, SIZE_NONCE,
};

use xutils::{
    array_like as xu_array, errors::EaError as xu_error, file as xu_file, hash as xu_hash,
    logger as xu_logger, string as xu_string,
};

// Convert a slice as an array
// Refer: https://stackoverflow.com/questions/25428920/how-to-get-a-slice-as-an-array-in-rust
fn u8_array_key(input: &[u8]) -> [u8; SIZE_KEY] {
    return input.try_into().expect("slice with incorrect length");
}

fn u8_array_nonce(input: &[u8]) -> [u8; SIZE_NONCE] {
    return input.try_into().expect("slice with incorrect length");
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

pub fn encrypt_bytes(pwd: &str, content: &Vec<u8>) -> Vec<u8> {
    let kkk = gen_key(pwd);
    let nnn = gen_nonce(pwd);

    match encrypt(
        &kkk,
        &nnn,
        &content,
        "".to_string(),
        "".to_string(),
        &[].to_vec(),
        &[].to_vec(),
    ) {
        Ok(d) => {
            return d.dist_vec;
        }
        Err(e) => {
            xu_logger::log_error(&format!("encrypt_bytes error:{:?}\n", e));
            return vec![];
        }
    };
}

pub fn decrypt_bytes(pwd: &str, content: &Vec<u8>) -> Vec<u8> {
    let kkk = gen_key(pwd);
    let nnn = gen_nonce(pwd);

    match decrypt(&kkk, &nnn, &content, "".to_string(), "".to_string(), 0, 0) {
        Ok(de) => return de.dist_vec,
        Err(e) => {
            xu_logger::log_error(&format!("decrypt_bytes error:{:?}\n", e));
            return [].to_vec();
        }
    };
}

pub fn decrypt_bytes_to_string(pwd: &str, content: &Vec<u8>) -> String {
    let dec = decrypt_bytes(pwd, content);
    return xu_string::bytes_to_string(&dec);
}

pub fn encrypt_file(pwd: &str, source_path: &str, dist_path: &str) -> EncryptRes {
    let kkk = gen_key(pwd);
    let nnn = gen_nonce(pwd);

    match encrypt(
        &kkk,
        &nnn,
        &[].to_vec(),
        source_path.to_owned(),
        dist_path.to_owned(),
        &[].to_vec(),
        &[].to_vec(),
    ) {
        Ok(d) => return d,
        Err(e) => {
            let eee = xu_error::EncryptFileError {
                path: source_path.to_owned(),
                error: e,
            };
            xu_logger::log_error(&format!("encrypt_file:: error: {}\n", eee));

            let res = EncryptRes {
                dist_vec: [].to_vec(),
                encrypted_data_len: 0,
            };
            return res;
        }
    }
}

pub fn decrypt_file(
    pwd: &str,
    source_path: &str,
    dist_path: &str,
    start: usize,
    end: usize,
) -> EncryptRes {
    let kkk = gen_key(pwd);
    let nnn = gen_nonce(pwd);

    // TODO

    match decrypt(
        &kkk,
        &nnn,
        &[].to_vec(),
        source_path.to_owned(),
        dist_path.to_owned(),
        start,
        end,
    ) {
        Ok(d) => return d,
        Err(e) => {
            let eee = xu_error::DecryptFileError {
                path: source_path.to_owned(),
                error: e,
            };
            xu_logger::log_error(&format!("decrypt_file:: error: {}\n", eee));

            let res = EncryptRes {
                dist_vec: [].to_vec(),
                encrypted_data_len: 0,
            };
            return res;
        }
    }
}

#[test]
pub fn test() {
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

    print!("check file \n\n")
}
