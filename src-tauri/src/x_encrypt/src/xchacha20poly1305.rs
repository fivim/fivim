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

use xutils::{
    array_like as xu_array, dir as xu_dir, file as xu_file, path as xu_path,
    progress as xu_progress, string as xu_string,
};

pub const SIZE_KEY: usize = 32;
const SIZE_NONCE_SMALL: usize = 24;
pub const SIZE_NONCE: usize = 19;
pub const BUFFER_LEN_ENCRYPT: usize = 500;
pub const BUFFER_LEN_DECRYPT: usize = BUFFER_LEN_ENCRYPT + 16;

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

pub fn encrypt_small(key: &Key, nonce: &Nonce, vec: &Vec<u8>) -> Vec<u8> {
    let cipher = XChaCha20Poly1305::new(key.into());
    match cipher.encrypt(&nonce_to_small(nonce).into(), vec.as_ref()) {
        Ok(r) => return r,
        Err(e) => {
            println!(">>> Encrypt small bytes, error:{}, vec:{:?} \n\n", e, vec);
            return [].to_vec();
        }
    }
}
pub fn decrypt_small(key: &Key, nonce: &Nonce, vec: &Vec<u8>) -> Vec<u8> {
    let cipher = XChaCha20Poly1305::new(key.into());
    match cipher.decrypt(&nonce_to_small(nonce).into(), vec.as_ref()) {
        Ok(r) => return r,
        Err(e) => {
            println!(">>> Decrypt small bytes, error: {}, vec: {:?} \n\n", e, vec);
            return [].to_vec();
        }
    };
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
    progress_name: String,
) -> Result<EncryptRes, anyhow::Error> {
    xu_progress::insert_new(&progress_name);

    let mut res = EncryptRes {
        dist_vec: [].to_vec(),
        encrypted_data_len: 0,
    };
    let vec_len = vec.len();
    let use_vec = file_path == "" && dist_path == "";

    if use_vec && vec_len < BUFFER_LEN_ENCRYPT {
        res.dist_vec = encrypt_small(key, nonce, vec);
        xu_progress::set(&progress_name, 1.0, "");
        return Ok(res);
    }

    let aead = XChaCha20Poly1305::new(key.as_ref().into());
    let mut stream_encryptor = stream::EncryptorBE32::from_aead(aead, nonce.as_ref().into());
    let mut buffer = [0u8; BUFFER_LEN_ENCRYPT];
    let mut data_length: usize = 0;
    let mut read_length: usize = 0;

    if use_vec && vec_len > 0 {
        // Process by vector
        let mut step_start: usize = 0;
        let mut step_end = step_start + BUFFER_LEN_ENCRYPT;
        let mut res_buffer: Vec<u8> = [].to_vec();
        let bytes_size = vec_len;

        loop {
            if step_end < bytes_size {
                buffer[..].clone_from_slice(&vec[step_start..step_end]);
                let cipher_vec =
                    stream_encryptor
                        .encrypt_next(buffer.as_slice())
                        .map_err(|err| {
                            anyhow!(
                                "Encrypt bytes step, error: {}, buffer len:{}, buffer: {:?}",
                                err,
                                buffer.len(),
                                buffer
                            )
                        })?;
                data_length += &cipher_vec.len();
                res_buffer = [res_buffer, cipher_vec].concat();

                step_start += BUFFER_LEN_ENCRYPT;
                step_end += BUFFER_LEN_ENCRYPT;

                xu_progress::set(&progress_name, (step_end / bytes_size) as f32, "");
            } else {
                // The last buffer
                let buf_last = &vec[step_start..bytes_size];
                let cipher_vec: Vec<u8>;
                if buf_last.len() < BUFFER_LEN_ENCRYPT {
                    cipher_vec = encrypt_small(key, nonce, &buf_last.to_vec());
                } else {
                    cipher_vec = stream_encryptor.encrypt_last(buf_last).map_err(|err| {
                        anyhow!(
                            "Encrypt bytes last, error: {}, buffer len:{}, buffer: {:?}",
                            err,
                            buf_last.len(),
                            buf_last
                        )
                    })?;
                }
                data_length += &cipher_vec.len();
                res_buffer = [res_buffer, cipher_vec].concat();
                res.dist_vec = res_buffer;

                xu_progress::set(&progress_name, 1.0, "");
                break;
            }
        }
    } else {
        // Process by file
        let file_size = xu_file::get_size(&file_path) as usize;
        let mut source_file = File::open(file_path)?;
        let mut dist_file = File::create(dist_path)?;

        if file_header.len() > 0 {
            dist_file.write(&file_header.to_vec())?;
        }

        loop {
            let read_count = source_file.read(&mut buffer)?;
            if read_count == BUFFER_LEN_ENCRYPT {
                let cipher_vec =
                    stream_encryptor
                        .encrypt_next(buffer.as_slice())
                        .map_err(|err| {
                            anyhow!(
                                "Encrypt file step, error: {}, buffer len:{}, buffer: {:?}",
                                err,
                                buffer.len(),
                                buffer
                            )
                        })?;
                dist_file.write(&cipher_vec)?;
                data_length += cipher_vec.len();

                xu_progress::set(&progress_name, read_length as f32 / file_size as f32, "");
                read_length += BUFFER_LEN_ENCRYPT;
            } else {
                // The last buffer
                let buf_last = &buffer[..read_count];
                let cipher_vec: Vec<u8>;
                if buf_last.len() < BUFFER_LEN_ENCRYPT {
                    cipher_vec = encrypt_small(key, nonce, &buf_last.to_vec());
                } else {
                    cipher_vec = stream_encryptor.encrypt_last(buf_last).map_err(|err| {
                        anyhow!(
                            "Encrypt file last, error: {}, buffer len:{}, buffer: {:?}",
                            err,
                            buf_last.len(),
                            buf_last
                        )
                    })?;
                }
                dist_file.write(&cipher_vec)?;
                data_length += cipher_vec.len();

                xu_progress::set(&progress_name, 1.0, "");
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
    progress_name: String,
) -> Result<EncryptRes, anyhow::Error> {
    xu_progress::insert_new(&progress_name);

    let mut res = EncryptRes {
        dist_vec: [].to_vec(),
        encrypted_data_len: 0,
    };
    let use_vec = file_path == "" && dist_path == "";
    let vec_len = vec.len();

    // Process all vec contents directly.
    if use_vec && vec_len < BUFFER_LEN_DECRYPT {
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

        res.dist_vec = decrypt_small(key, nonce, &final_vec.to_vec());
        xu_progress::set(&progress_name, 1.0, "");
        return Ok(res);
    }

    // Use stream to process vec or file.
    let aead = XChaCha20Poly1305::new(key.as_ref().into());
    let mut stream_decryptor = stream::DecryptorBE32::from_aead(aead, nonce.as_ref().into());
    let mut buffer = [0u8; BUFFER_LEN_DECRYPT];
    let mut data_length: usize = 0;
    let mut enable_limit = false;
    if start > 0 {
        enable_limit = true;
    }

    let mut read_length: usize = 0;

    // Use stream to process vec content.
    if use_vec && vec_len > 0 {
        // Process by vector.
        let bytes_size = vec_len;
        if end > 0 {
            let tail_length: usize = bytes_size - end;
            if tail_length > BUFFER_LEN_DECRYPT {
                return Err(anyhow!(
                    "Decrypt file tail(end position: {}) greater then buffer size {}",
                    end,
                    BUFFER_LEN_DECRYPT
                ));
            }
        }

        let mut step_start = 0;
        let mut step_end = step_start + BUFFER_LEN_DECRYPT;
        loop {
            if step_end < bytes_size {
                buffer[..].clone_from_slice(&vec[step_start..step_end]);
                let plaintext =
                    stream_decryptor
                        .decrypt_next(buffer.as_slice())
                        .map_err(|err| {
                            anyhow!(
                                "Decrypt bytes step, error: {}, buffer len: {}, buffer: {:?}",
                                err,
                                buffer.len(),
                                buffer
                            )
                        })?;
                res.dist_vec = [res.dist_vec, plaintext].concat();

                step_start += BUFFER_LEN_DECRYPT;
                step_end += BUFFER_LEN_DECRYPT;

                xu_progress::set(&progress_name, step_end as f32 / bytes_size as f32, "");
            } else {
                // The last buffer
                let buf_last = &vec[step_start..bytes_size];
                let plaintext: Vec<u8>;
                if buf_last.len() < BUFFER_LEN_DECRYPT {
                    plaintext = decrypt_small(key, nonce, &buf_last.to_vec());
                } else {
                    plaintext = stream_decryptor.decrypt_last(buf_last).map_err(|err| {
                        anyhow!(
                            "Decrypt bytes last, error: {}, buffer len: {}, buffer: {:?}",
                            err,
                            buf_last.len(),
                            buf_last
                        )
                    })?;
                }

                data_length += &plaintext.len();
                res.dist_vec = [res.dist_vec, plaintext].concat();
                res.encrypted_data_len = res.dist_vec.len();

                xu_progress::set(&progress_name, 1.0, "");
                break;
            }
        }
    } else {
        // Process by file
        let file_size = xu_file::get_size(&file_path) as usize;
        let mut tail_length = 0;
        if end > 0 {
            tail_length = file_size as usize - end;
            if tail_length > BUFFER_LEN_DECRYPT {
                return Err(anyhow!(
                    "Decrypt file tail(end position: {}) greater then buffer size{}",
                    end,
                    BUFFER_LEN_DECRYPT
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

            if read_count == BUFFER_LEN_DECRYPT {
                read_length += BUFFER_LEN_DECRYPT;

                let plaintext: Vec<u8>;
                let left_size = file_size - read_length;
                // left size less than tail size, truncate the buffer.
                if tail_length > 0 && left_size < tail_length {
                    let end = BUFFER_LEN_DECRYPT - (tail_length - left_size);
                    let mut last_vec: Vec<u8> = vec![];
                    last_vec.copy_from_slice(&buffer[..end]);
                    plaintext = decrypt_small(key, nonce, &last_vec.to_vec());
                } else {
                    plaintext =
                        stream_decryptor
                            .decrypt_next(buffer.as_slice())
                            .map_err(|err| {
                                anyhow!(
                                    "Decrypt file step, error: {:?}, buffer len: {}, buffer: {:?}",
                                    err,
                                    buffer.len(),
                                    buffer
                                )
                            })?;
                }

                dist_file.write(&plaintext)?;
                data_length += plaintext.len();

                xu_progress::set(&progress_name, read_length as f32 / file_size as f32, "");
            } else if read_count == 0 {
                break;
            } else {
                // The last buffer
                let final_end: usize;
                if enable_limit {
                    // Remove the tail.
                    final_end = read_count - tail_length;
                } else {
                    final_end = read_count;
                }

                let buf_last = &buffer[..final_end];
                let plaintext: Vec<u8>;
                if read_count < BUFFER_LEN_DECRYPT {
                    plaintext = decrypt_small(key, nonce, &buf_last.to_vec());
                } else {
                    plaintext = stream_decryptor.decrypt_last(buf_last).map_err(|err| {
                        anyhow!(
                            "Decrypt file last, error: {}, buffer len: {}, buffer: {:?}",
                            err,
                            buf_last.len(),
                            buf_last
                        )
                    })?;
                }

                dist_file.write(&plaintext)?;
                data_length += plaintext.len();

                xu_progress::set(&progress_name, 1.0, "");
                // read_length += read_count;
                break;
            }
        }
    }

    res.encrypted_data_len = data_length;

    Ok(res)
}

pub fn re_encrypt_file(
    key: &Key,
    nonce: &Nonce,
    key_new: &Key,
    nonce_new: &Nonce,
    file_path: &str,
    start: usize,
    end: usize,
    dist_path: &str,
    dist_file_header: &Vec<u8>,
    dist_file_tail: &Vec<u8>,
    progress_name: String,
) -> Result<usize, anyhow::Error> {
    xu_progress::insert_new(&progress_name);

    let mut buffer_dec = [0u8; BUFFER_LEN_DECRYPT];
    let mut source_file = File::open(file_path)?;

    xu_dir::check_or_create(xu_path::get_parent_dir_path(&dist_path).as_str());
    let mut dist_file = File::create(dist_path)?;

    // Small file
    let file_size = xu_file::get_size(&file_path) as usize;
    if file_size < BUFFER_LEN_DECRYPT {
        source_file.read(&mut buffer_dec)?;

        let mut stop = BUFFER_LEN_DECRYPT;
        if end > 0 {
            stop = end;
        }
        let final_vec = &buffer_dec[start..stop];

        let plaintext = decrypt_small(key, nonce, &final_vec.to_vec());
        let cipher_vec = encrypt_small(key, nonce, &plaintext.to_vec());
        dist_file.write(&cipher_vec)?;

        xu_progress::set(&progress_name, 1.0, "");
        return Ok(cipher_vec.len());
    }

    // Big file
    let aead_dec = XChaCha20Poly1305::new(key.as_ref().into());
    let mut stream_decryptor = stream::DecryptorBE32::from_aead(aead_dec, nonce.as_ref().into());
    let aead_enc = XChaCha20Poly1305::new(key_new.as_ref().into());
    let mut stream_encryptor =
        stream::EncryptorBE32::from_aead(aead_enc, nonce_new.as_ref().into());

    let mut enable_limit = false;
    if start > 0 {
        enable_limit = true;
    }
    let mut re_encrypt_data_len: usize = 0;
    let mut read_length: usize = 0;

    let file_size = xu_file::get_size(&file_path) as usize;
    let mut tail_length = 0;
    if end > 0 {
        tail_length = file_size as usize - end;
        if tail_length > BUFFER_LEN_DECRYPT {
            return Err(anyhow!(
                "Re-Encrypt file tail(end position: {}) greater then buffer size{}",
                end,
                BUFFER_LEN_DECRYPT
            ));
        }
    }

    // Skip the header of the data
    if enable_limit {
        source_file.seek(SeekFrom::Start(start as u64))?;
    }

    if dist_file_header.len() > 0 {
        dist_file.write(&dist_file_header.to_vec())?;
    }

    loop {
        let read_count = source_file.read(&mut buffer_dec)?;

        if read_count == BUFFER_LEN_DECRYPT {
            read_length += BUFFER_LEN_DECRYPT;

            let plaintext: Vec<u8>;
            let left_size = file_size - read_length;
            // left size less than tail size, truncate the buffer.
            if tail_length > 0 && left_size < tail_length {
                let end = BUFFER_LEN_DECRYPT - (tail_length - left_size);
                let mut last_vec: Vec<u8> = vec![];
                last_vec.copy_from_slice(&buffer_dec[..end]);
                plaintext = decrypt_small(key, nonce, &last_vec.to_vec());
            } else {
                plaintext = stream_decryptor
                    .decrypt_next(buffer_dec.as_slice())
                    .map_err(|err| {
                        anyhow!(
                        "Re-Encrypt decrypt file step, error: {:?}, buffer len: {}, buffer: {:?}",
                        err,
                        buffer_dec.len(),
                        buffer_dec
                    )
                    })?;
            }

            let cipher_vec = stream_encryptor
                .encrypt_next(plaintext.as_slice())
                .map_err(|err| {
                    anyhow!(
                        "Re-Encrypt encrypt file step, error: {}, buffer len:{}, buffer: {:?}",
                        err,
                        plaintext.len(),
                        plaintext,
                    )
                })?;
            dist_file.write(&cipher_vec)?;
            re_encrypt_data_len += cipher_vec.len();

            xu_progress::set(&progress_name, read_length as f32 / file_size as f32, "");
        } else if read_count == 0 {
            break;
        } else {
            // The last buffer
            let final_end: usize;
            if enable_limit {
                // Remove the tail.
                final_end = read_count - tail_length;
            } else {
                final_end = read_count;
            }

            let buf_last = &buffer_dec[..final_end];
            let plaintext: Vec<u8>;
            if buf_last.len() < BUFFER_LEN_DECRYPT {
                plaintext = decrypt_small(key, nonce, &buf_last.to_vec());
            } else {
                plaintext = stream_decryptor.decrypt_last(buf_last).map_err(|err| {
                    anyhow!(
                        "Re-Encrypt decrypt file last, error: {}, buffer len: {:?}, buffer: {:?}",
                        err,
                        buffer_dec.len(),
                        buffer_dec
                    )
                })?;
            }

            let cipher_vec: Vec<u8>;
            if plaintext.len() < BUFFER_LEN_ENCRYPT {
                cipher_vec = encrypt_small(key_new, nonce_new, &plaintext.to_vec());
            } else {
                cipher_vec = stream_encryptor
                    .encrypt_next(plaintext.as_slice())
                    .map_err(|err| {
                        anyhow!(
                            "Re-Encrypt encrypt file last2, err:{:?}, buffer: {:?}",
                            err,
                            plaintext
                        )
                    })?;
            }
            dist_file.write(&cipher_vec)?;
            re_encrypt_data_len += cipher_vec.len();

            xu_progress::set(&progress_name, 1.0, "");
            break;
        }
    }

    if dist_file_tail.len() > 0 {
        dist_file.write(&dist_file_tail.to_vec())?;
    }

    Ok(re_encrypt_data_len)
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
        "".to_string(),
    ) {
        Ok(d) => d.dist_vec,
        Err(e) => return println!("test encrypt error {}", e),
    };

    let dec_text = match decrypt(
        &kkk,
        &nnn,
        &enc_text,
        "".to_string(),
        "".to_string(),
        0,
        0,
        "".to_string(),
    ) {
        Ok(de) => de,
        Err(e) => return println!("test decrypt error {}", e),
    };

    let dec_text_str = xu_string::bytes_to_string(&dec_text.dist_vec);

    println!(">>> text len :{}", text.len());
    println!(
        ">>> vector after encrypt: {:?} len: {}",
        &enc_text,
        &enc_text.len()
    );
    println!(">>> text after decrypt: {:?}", dec_text_str);

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
        "".to_string(),
    ) {
        Ok(d) => d,
        Err(e) => {
            println!("encrypt_file:: error: {}", e);
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
        "".to_string(),
    ) {
        Ok(d) => d,
        Err(e) => {
            println!("decrypt_file:: error: {}", e);
            return;
        }
    };

    if enc.encrypted_data_len > 0 && dec.encrypted_data_len > 0 {
        println!("test over");
    }
}
