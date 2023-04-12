use aes::cipher::{block_padding::Pkcs7, BlockDecryptMut, BlockEncryptMut, KeyIvInit};
// use aes::cipher::
// use cbc::cipher::StreamClosure;

use rand_core::{OsRng, RngCore};

type Aes256CbcEnc = cbc::Encryptor<aes::Aes256>;
type Aes256CbcDec = cbc::Decryptor<aes::Aes256>;

fn generate_iv() -> [u8; 16] {
    let mut rng = OsRng;
    let mut bytes = [0u8; 16];
    rng.fill_bytes(&mut bytes);

    bytes
}

pub fn encrypt_u8_vec(key: &[u8; 32], plain: &[u8]) -> (Vec<u8>, [u8; 16]) {
    let iv = generate_iv();
    let mut buf = [0u8; 48];
    let pt_len = plain.len();
    buf[..pt_len].copy_from_slice(plain);
    let ct = Aes256CbcEnc::new(key.into(), &iv.into())
        .encrypt_padded_b2b_mut::<Pkcs7>(plain, &mut buf)
        .unwrap();

    (ct.to_vec(), iv)
}

pub fn decrypt_u8_vec(key: &[u8; 32], cipher: &[u8], iv: [u8; 16]) -> Vec<u8> {
    let cipher_len = cipher.len();
    let mut buf = [0u8; 48];
    buf[..cipher_len].copy_from_slice(cipher);

    let pt = Aes256CbcDec::new(key.into(), &iv.into())
        .decrypt_padded_b2b_mut::<Pkcs7>(cipher, &mut buf)
        .unwrap();

    pt.to_vec()
}

pub fn encrypt_large_file(
    key: &[u8; 32],
    file_path: &str,
    dist_file_path: &str,
    file_header: &[u8],
    file_tail: &[u8],
) -> Result<(), anyhow::Error> {

    Ok(())
}

pub fn decrypt_large_file(
    key: &[u8; 32],
    file_path: &str,
    dist_file_path: &str,
) -> Result<(), anyhow::Error> {

    Ok(())
}

#[test]
pub fn test_aes_cbc_256() {
    let key = b"gtwadzkhjtfokdtcmqkdagotqfntbjws";
    let plain = b"This is not a password";
    let (ct, iv) = encrypt_u8_vec(key, plain);
    let pt = decrypt_u8_vec(key, &ct, iv);

    let separator = "*".repeat(40);
    println!("plain: {:?}", plain);
    println!(
        "{}\nciphertext: {:?}\n iv{:?}\n{}",
        separator, ct, iv, separator
    );
    println!("decrypted: {:?}", pt);

    assert_eq!(plain.to_vec(), pt);
}
