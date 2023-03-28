// Refer: https://kerkour.com/rust-file-encryption
//        https://github.com/skerkour/kerkour.com/blob/main/blog/2021/rust_file_encryption/src/main.rs
use anyhow::anyhow;
use ccm::KeyInit;
use chacha20poly1305::{
    aead::{stream, Aead},
    XChaCha20Poly1305,
};
use rand_core::{OsRng, RngCore};

use std::{
    fs::File,
    io::{Read, Seek, SeekFrom, Write},
};

use xutils::{array_like as xu_array, file as xu_file, string as xu_string};

pub const SIZE_KEY: usize = 32;
const SIZE_NONCE_SMALL: usize = 24;
pub const SIZE_NONCE: usize = 19;

pub type Key = [u8; SIZE_KEY];
pub type Nonce = [u8; SIZE_NONCE];
pub type NonceSmall = [u8; SIZE_NONCE_SMALL];

#[derive(Debug)]
pub struct EncryptRes {
    pub dist_vec: Vec<u8>,
    pub encrypted_data_len: usize,
}

fn nonce_to_small(nonce: &Nonce) -> NonceSmall {
    let nnn = xu_array::fill_arr_u8(nonce, SIZE_NONCE_SMALL, true);
    let mut ns: NonceSmall = [0u8; SIZE_NONCE_SMALL];
    for n in 0..SIZE_NONCE_SMALL {
        ns[n] = nnn[n]
    }

    return ns;
}

/// eycrypt bytes or file
/// If vec is not empty, encrypt as bytes in memory.
/// If vec is empty, file_path and dist_path are not empty, it will be treated as a large file.
///
/// If file_header and/or file_tail are/is not empty,
/// they will write to the header or tail of the dist file(by dist_path).
pub fn encrypt(
    key: &Key,
    nonce: &Nonce,
    vec: &Vec<u8>,
    file_path: String,
    dist_path: String,
    file_header: &Vec<u8>,
    file_tail: &Vec<u8>,
) -> Result<EncryptRes, anyhow::Error> {
    const BUFFER_LEN: usize = 500;
    let mut res = EncryptRes {
        dist_vec: [].to_vec(),
        encrypted_data_len: 0,
    };
    let use_vec = file_path == "" && dist_path == "";
    let vec_len = vec.len();

    if use_vec && vec_len < BUFFER_LEN {
        let cipher = XChaCha20Poly1305::new(key.into());
        match cipher.encrypt(&nonce_to_small(nonce).into(), vec.as_ref()) {
            Ok(r) => {
                res.dist_vec = r;
                return Ok(res);
            }
            Err(e) => {
                print!(
                    ">>> encrypt bytes error: >>>{}<<<, vec: >>>{:?}<<< \n\n",
                    e, vec
                );
                return Ok(res);
            }
        }
    }

    let aead = XChaCha20Poly1305::new(key.as_ref().into());
    let mut stream_encryptor = stream::EncryptorBE32::from_aead(aead, nonce.as_ref().into());
    let mut buffer = [0u8; BUFFER_LEN];
    let mut data_length: usize = 0;

    if use_vec && vec_len > 0 {
        // Process by vector
        let mut step_start = 0;
        let mut step_end = step_start + BUFFER_LEN;
        let mut res_buffer: Vec<u8> = [].to_vec();
        let bytes_size = vec_len;

        loop {
            if step_end < bytes_size {
                buffer[..].clone_from_slice(&vec[step_start..step_end]);
                let cipher_vec =
                    stream_encryptor
                        .encrypt_next(buffer.as_slice())
                        .map_err(|err| {
                            anyhow!("Encrypt bytes step buffer: {:?}, error: {}", buffer, err)
                        })?;
                data_length += &cipher_vec.len();
                res_buffer = [res_buffer, cipher_vec].concat();

                step_start += BUFFER_LEN;
                step_end += BUFFER_LEN;
            } else {
                // The last buffer
                let last = &vec[step_start..bytes_size];
                let last_filled = xu_array::fill_arr_u8(&last, BUFFER_LEN, false);
                buffer[..].clone_from_slice(&last_filled);
                let cipher_vec = stream_encryptor
                    .encrypt_last(&buffer[..bytes_size - step_start])
                    .map_err(|err| {
                        anyhow!("Encrypt bytes last buffer: {:?}, error: {}", buffer, err)
                    })?;
                data_length += &cipher_vec.len();
                res_buffer = [res_buffer, cipher_vec].concat();
                res.dist_vec = res_buffer;

                break;
            }
        }
    } else {
        // Process by file
        let mut source_file = File::open(file_path)?;
        let mut dist_file = File::create(dist_path)?;

        if file_header.len() > 0 {
            dist_file.write(&file_header.to_vec())?;
        }

        loop {
            let read_count = source_file.read(&mut buffer)?;
            if read_count == BUFFER_LEN {
                let cipher_vec =
                    stream_encryptor
                        .encrypt_next(buffer.as_slice())
                        .map_err(|err| {
                            anyhow!("Encrypt file step buffer: {:?}, error: {}", buffer, err)
                        })?;
                dist_file.write(&cipher_vec)?;
                data_length += cipher_vec.len();
            } else {
                // The last buffer
                let cipher_vec = stream_encryptor
                    .encrypt_last(&buffer[..read_count])
                    .map_err(|err| {
                        anyhow!("Encrypt file last buffer: {:?}, error: {}", buffer, err)
                    })?;
                dist_file.write(&cipher_vec)?;
                data_length += cipher_vec.len();
                break;
            }
        }

        if file_tail.len() > 0 {
            dist_file.write(&file_tail.to_vec())?;
        }
    }

    res.encrypted_data_len = data_length;

    Ok(res)
}

/// decrypt bytes or file
/// If vec is not empty, decrypt as bytes in memory.
/// If vec is empty, file_path and dist_path are not empty, it will be treated as a large file.
///
/// start and end
/// Thay are the postion of file data.
/// file size - end = tail, the tail size should less then BUFFER_LEN(516).
pub fn decrypt(
    key: &Key,
    nonce: &Nonce,
    vec: &Vec<u8>,
    file_path: String,
    dist_path: String,
    start: usize,
    end: usize,
) -> Result<EncryptRes, anyhow::Error> {
    const BUFFER_LEN: usize = 500 + 16;
    let mut res = EncryptRes {
        dist_vec: [].to_vec(),
        encrypted_data_len: 0,
    };
    let use_vec = file_path == "" && dist_path == "";
    let vec_len = vec.len();

    // Process all vec contents directly.
    if use_vec && vec_len < BUFFER_LEN {
        if end > vec_len {
            return Err(anyhow!(
                "Decrypt file tail(end position: {}) greater then vec size {}",
                end,
                vec_len
            ));
        }

        let mut stop = vec_len;
        if end > 0 {
            stop = end;
        }
        let final_vec = &vec[start..stop];

        let cipher = XChaCha20Poly1305::new(key.into());
        match cipher.decrypt(&nonce_to_small(nonce).into(), final_vec.as_ref()) {
            Ok(r) => {
                res.dist_vec = r;
                return Ok(res);
            }
            Err(e) => {
                print!(
                    ">>> Decrypt bytes error: >>>{}<<<, vec: >>>{:?}<<< \n\n",
                    e, vec
                );
                return Ok(res);
            }
        };
    }

    // Use stream to process vec or file.
    let aead = XChaCha20Poly1305::new(key.as_ref().into());
    let mut stream_decryptor = stream::DecryptorBE32::from_aead(aead, nonce.as_ref().into());
    let mut buffer = [0u8; BUFFER_LEN];
    let mut data_length: usize = 0;
    let mut enable_limit = false;
    if start > 0 {
        enable_limit = true;
    }

    // Use stream to process vec content.
    if use_vec && vec_len > 0 {
        // Process by vector.
        let bytes_size = vec_len;
        if end > 0 {
            let tail_length: usize = bytes_size - end;
            if tail_length > BUFFER_LEN {
                return Err(anyhow!(
                    "Decrypt file tail(end position: {}) greater then buffer size {}",
                    end,
                    BUFFER_LEN
                ));
            }
        }

        let mut step_start = 0;
        let mut step_end = step_start + BUFFER_LEN;
        loop {
            if step_end < bytes_size {
                buffer[..].clone_from_slice(&vec[step_start..step_end]);
                let plaintext =
                    stream_decryptor
                        .decrypt_next(buffer.as_slice())
                        .map_err(|err| {
                            anyhow!("Decrypt bytes step buffer: {:?}, error: {}", buffer, err)
                        })?;
                res.dist_vec = [res.dist_vec, plaintext].concat();

                step_start += BUFFER_LEN;
                step_end += BUFFER_LEN;
            } else {
                // The last buffer
                #[warn(unused_assignments)]
                let mut final_end = 0;
                if enable_limit {
                    // Remove the tail.
                    final_end = bytes_size - end;
                } else {
                    final_end = bytes_size - step_start;
                    // Fill the buffer.
                    let last = &vec[step_start..bytes_size];
                    let last_filled = xu_array::fill_arr_u8(&last, BUFFER_LEN, false);
                    buffer[..].clone_from_slice(&last_filled);
                }

                let last = &vec[step_start..bytes_size];
                let last_filled = xu_array::fill_arr_u8(&last, BUFFER_LEN, false);
                buffer[..].clone_from_slice(&last_filled);
                let plaintext = stream_decryptor
                    .decrypt_last(&buffer[..final_end])
                    .map_err(|err| {
                        anyhow!("Decrypt bytes last buffer: {:?}, error: {}", buffer, err)
                    })?;
                data_length += &plaintext.len();
                res.dist_vec = [res.dist_vec, plaintext].concat();
                res.encrypted_data_len = res.dist_vec.len();

                break;
            }
        }
    } else {
        // Process by file
        let file_size = xu_file::get_size(&file_path);
        let mut tail_length = 0;
        if end > 0 {
            tail_length = file_size as usize - end;
            if tail_length > BUFFER_LEN {
                return Err(anyhow!(
                    "Decrypt file tail(end position: {}) greater then buffer size{}",
                    end,
                    BUFFER_LEN
                ));
            }
        }

        let mut source_file = File::open(file_path)?;
        let mut dist_file = File::create(dist_path)?;

        // Skip the header of the data
        if enable_limit {
            source_file.seek(SeekFrom::Start(start as u64))?;
        }

        loop {
            let read_count = source_file.read(&mut buffer)?;

            if read_count == BUFFER_LEN {
                let plaintext =
                    stream_decryptor
                        .decrypt_next(buffer.as_slice())
                        .map_err(|err| {
                            anyhow!("Decrypt file step buffer: {:?}, error: {:?}", buffer, err)
                        })?;

                dist_file.write(&plaintext)?;
                data_length += plaintext.len();
            } else if read_count == 0 {
                break;
            } else {
                // The last buffer
                #[warn(unused_assignments)]
                let mut final_end = 0;
                if enable_limit {
                    // Remove the tail.
                    final_end = read_count - tail_length;
                } else {
                    final_end = read_count;
                }

                let plaintext = stream_decryptor
                    .decrypt_last(&buffer[..final_end])
                    .map_err(|err| {
                        anyhow!(
                            "Decrypt file last buffer with limit: {:?}, error: {}",
                            buffer,
                            err
                        )
                    })?;
                dist_file.write(&plaintext)?;
                data_length += plaintext.len();
                break;
            }
        }
    }

    res.encrypted_data_len = data_length;

    Ok(res)
}

// #[test]
pub fn test_string(text: &str) {
    let mut kkk = [0u8; SIZE_KEY];
    let mut nnn = [0u8; SIZE_NONCE];
    OsRng.fill_bytes(&mut kkk);
    OsRng.fill_bytes(&mut nnn);

    let enc_text = match encrypt(
        &kkk,
        &nnn,
        &text.as_bytes().to_vec(),
        "".to_string(),
        "".to_string(),
        &[].to_vec(),
        &[].to_vec(),
    ) {
        Ok(d) => d.dist_vec,
        Err(e) => return print!("test encrypt error {}\n", e),
    };

    let dec_text = match decrypt(&kkk, &nnn, &enc_text, "".to_string(), "".to_string(), 0, 0) {
        Ok(de) => de,
        Err(e) => return print!("test decrypt error {}\n", e),
    };

    let dec_text_str = xu_string::bytes_to_string(&dec_text.dist_vec);

    print!(">>> text len :{} \n", text.len());
    print!(
        ">>> vector after encrypt: {:?} len: {} \n",
        &enc_text,
        &enc_text.len()
    );
    print!(">>> text after decrypt: {:?} \n", dec_text_str);

    assert_eq!(text, dec_text_str);
}

pub fn test_file(
    source_path: &str,
    enc_dist_path: &str,
    dec_dist_path: &str,
    header: &Vec<u8>,
    tail: &Vec<u8>,
) {
    let mut kkk = [0u8; SIZE_KEY];
    let mut nnn = [0u8; SIZE_NONCE];
    OsRng.fill_bytes(&mut kkk);
    OsRng.fill_bytes(&mut nnn);

    let enc = match encrypt(
        &kkk,
        &nnn,
        &[].to_vec(),
        source_path.to_owned(),
        enc_dist_path.to_owned(),
        header,
        tail,
    ) {
        Ok(d) => d,
        Err(e) => {
            print!("encrypt_file:: error: {}\n", e);
            return;
        }
    };

    let dec = match decrypt(
        &kkk,
        &nnn,
        &[].to_vec(),
        enc_dist_path.to_owned(),
        dec_dist_path.to_owned(),
        header.len(),
        tail.len(),
    ) {
        Ok(d) => d,
        Err(e) => {
            print!("decrypt_file:: error: {}\n", e);
            return;
        }
    };
}
