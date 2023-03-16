// Refer: https://kerkour.com/rust-file-encryption
//        https://github.com/skerkour/kerkour.com/blob/main/blog/2021/rust_file_encryption/src/main.rs
use anyhow::anyhow;
use ccm::KeyInit;
use chacha20poly1305::{
    aead::{stream, Aead},
    XChaCha20Poly1305,
};
use rand::{rngs::OsRng, RngCore};
use std::{
    fs::{self, File},
    io::{Read, Write},
};

pub fn encrypt_u8_arr(
    u8_arr: &Vec<u8>,
    key: &[u8; 32],
    nonce: &[u8; 24],
) -> Result<Vec<u8>, ccm::Error> {
    let cipher = XChaCha20Poly1305::new(key.into());
    return cipher.encrypt(nonce.into(), u8_arr.as_ref());
}

pub fn decrypt_u8_arr(
    u8_arr: &Vec<u8>,
    key: &[u8; 32],
    nonce: &[u8; 24],
) -> Result<Vec<u8>, ccm::Error> {
    let cipher = XChaCha20Poly1305::new(key.into());
    return cipher.decrypt(nonce.into(), u8_arr.as_ref());
}

pub fn encrypt_small_file(
    filepath: &str,
    dist: &str,
    key: &[u8; 32],
    nonce: &[u8; 24],
) -> Result<(), anyhow::Error> {
    let cipher = XChaCha20Poly1305::new(key.into());
    let file_data = fs::read(filepath)?;
    let encrypted_file = cipher
        .encrypt(nonce.into(), file_data.as_ref())
        .map_err(|err| anyhow!("Encrypting small file: {}", err))?;

    fs::write(&dist, encrypted_file)?;

    Ok(())
}

pub fn decrypt_small_file(
    encrypted_file_path: &str,
    dist: &str,
    key: &[u8; 32],
    nonce: &[u8; 24],
) -> Result<(), anyhow::Error> {
    let cipher = XChaCha20Poly1305::new(key.into());
    let file_data = fs::read(encrypted_file_path)?;
    let decrypted_file = cipher
        .decrypt(nonce.into(), file_data.as_ref())
        .map_err(|err| anyhow!("Decrypting small file: {}", err))?;

    fs::write(&dist, decrypted_file)?;

    Ok(())
}

pub fn encrypt_large_file(
    source_file_path: &str,
    dist_file_path: &str,
    key: &[u8; 32],
    nonce: &[u8; 19],
    file_header: &[u8],
    file_tail: &[u8],
) -> Result<(), anyhow::Error> {
    let aead = XChaCha20Poly1305::new(key.as_ref().into());
    let mut stream_encryptor = stream::EncryptorBE32::from_aead(aead, nonce.as_ref().into());

    const BUFFER_LEN: usize = 500;
    let mut buffer = [0u8; BUFFER_LEN];

    let mut source_file = File::open(source_file_path)?;
    let mut dist_file = File::create(dist_file_path)?;

    dist_file.write(file_header)?;

    loop {
        let read_count = source_file.read(&mut buffer)?;

        if read_count == BUFFER_LEN {
            let ciphertext = stream_encryptor
                .encrypt_next(buffer.as_slice())
                .map_err(|err| anyhow!("Encrypting large file: {}", err))
                .unwrap();
            dist_file.write(&ciphertext)?;
        } else {
            let ciphertext = stream_encryptor
                .encrypt_last(&buffer[..read_count])
                .map_err(|err| anyhow!("Encrypting large file: {}", err))
                .unwrap();
            dist_file.write(&ciphertext)?;
            break;
        }
    }

    dist_file.write(file_tail)?;

    Ok(())
}

pub fn decrypt_large_file(
    encrypted_file_path: &str,
    dist: &str,
    key: &[u8; 32],
    nonce: &[u8; 19],
) -> Result<(), anyhow::Error> {
    let aead = XChaCha20Poly1305::new(key.as_ref().into());
    let mut stream_decryptor = stream::DecryptorBE32::from_aead(aead, nonce.as_ref().into());

    const BUFFER_LEN: usize = 500 + 16;
    let mut buffer = [0u8; BUFFER_LEN];

    let mut encrypted_file = File::open(encrypted_file_path)?;
    let mut dist_file = File::create(dist)?;

    loop {
        let read_count = encrypted_file.read(&mut buffer)?;

        if read_count == BUFFER_LEN {
            let plaintext = stream_decryptor
                .decrypt_next(buffer.as_slice())
                .map_err(|err| anyhow!("Decrypting large file: {}", err))
                .unwrap();
            dist_file.write(&plaintext)?;
        } else if read_count == 0 {
            break;
        } else {
            let plaintext = stream_decryptor
                .decrypt_last(&buffer[..read_count])
                .map_err(|err| anyhow!("Decrypting large file: {}", err))
                .unwrap();
            dist_file.write(&plaintext)?;
            break;
        }
    }

    Ok(())
}

pub fn test() -> Result<(), anyhow::Error> {
    let mut small_file_key = [0u8; 32];
    let mut small_file_nonce = [0u8; 24];
    OsRng.fill_bytes(&mut small_file_key);
    OsRng.fill_bytes(&mut small_file_nonce);

    println!("Encrypting 100.bin to 100.encrypted");
    encrypt_small_file(
        "./test_data/chacha20poly1305/100.bin",
        "./test_data/chacha20poly1305/100.encrypted",
        &small_file_key,
        &small_file_nonce,
    )?;

    println!("Decrypting 100.encrypted to 100.decrypted");
    decrypt_small_file(
        "./test_data/chacha20poly1305/100.encrypted",
        "./test_data/chacha20poly1305/100.decrypted",
        &small_file_key,
        &small_file_nonce,
    )?;

    let mut large_file_key = [0u8; 32];
    let mut large_file_nonce = [0u8; 19];
    OsRng.fill_bytes(&mut large_file_key);
    OsRng.fill_bytes(&mut large_file_nonce);

    println!("Encrypting 2048.bin to 2048.encrypted");
    encrypt_large_file(
        "./test_data/chacha20poly1305/2048.bin",
        "./test_data/chacha20poly1305/2048.encrypted",
        &large_file_key,
        &large_file_nonce,
        &[0].to_vec(),
        &[0].to_vec(),
    )?;

    println!("Decrypting 2048.encrypted to 2048.decrypted");
    decrypt_large_file(
        "./test_data/chacha20poly1305/2048.encrypted",
        "./test_data/chacha20poly1305/2048.decrypted",
        &large_file_key,
        &large_file_nonce,
    )?;

    println!("Encrypting 500.bin to 500.encrypted");
    encrypt_large_file(
        "./test_data/chacha20poly1305/500.bin",
        "./test_data/chacha20poly1305/500.encrypted",
        &large_file_key,
        &large_file_nonce,
        &[0].to_vec(),
        &[0].to_vec(),
    )?;

    println!("Decrypting 500.encrypted to 500.decrypted");
    decrypt_large_file(
        "./test_data/chacha20poly1305/500.encrypted",
        "./test_data/chacha20poly1305/500.decrypted",
        &large_file_key,
        &large_file_nonce,
    )?;

    Ok(())
}
