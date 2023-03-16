//! # sjcl
//! Simple decrypt-only SJCL library.
//!
//! Only supports AES-CCM so far, but OCB2 is deprecated AFAIK.
//! To use you only need the result of a SJCL encrypted secret and the
//! passphrase.
//!
//! ## Usage
//!
//! Decrypt a file loaded into a string:
//! ```rust
//! use sjcl::decrypt_json;
//! use sjcl::SjclError;
//!
//! # fn main() -> Result<(), SjclError> {
//! let data = "{\"iv\":\"nJu7KZF2eEqMv403U2oc3w==\", \"v\":1, \"iter\":10000, \"ks\":256, \"ts\":64, \"mode\":\"ccm\", \"adata\":\"\", \"cipher\":\"aes\", \"salt\":\"mMmxX6SipEM=\", \"ct\":\"VwnKwpW1ah5HmdvwuFBthx0=\"}".to_string();
//! let password_phrase = "abcdefghi".to_string();
//! let plaintext = decrypt_json(data, password_phrase, None)?;
//! assert_eq!("test\ntest".to_string(), String::from_utf8(plaintext).unwrap());
//! # Ok(())
//! # }
//! ```
//!
pub mod decryption;
pub mod encryption;

pub use decryption::{decrypt, decrypt_json};
pub use encryption::encrypt;

use aes::{Aes128, Aes192, Aes256};
use ccm::{
    consts::{U13, U8},
    Ccm,
};

use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum SjclError {
    #[error("Failed to decrypt chunk: {message:?}")]
    DecryptionError { message: String },
    #[error("Failed to encrypt: {message:?}")]
    EncryptionError { message: String },
    #[error("Method is not implemented")]
    NotImplementedError,
}

/// SJCL result contains all params as well as
/// either the plaintext or the ciphertext in the last element.
#[derive(Debug, Deserialize, Serialize, PartialEq)]
pub struct SjclBlock {
    iv: String,
    v: u32,
    iter: u32,
    ks: usize,
    ts: usize,
    mode: String,
    adata: String,
    cipher: String,
    salt: String,
    ct: String,
}

impl SjclBlock {
    pub fn new(
        iv: String,
        v: u32,
        iter: u32,
        ks: usize,
        ts: usize,
        mode: String,
        adata: String,
        cipher: String,
        salt: String,
        ct: String,
    ) -> SjclBlock {
        SjclBlock {
            iv,
            v,
            iter,
            ks,
            ts,
            mode,
            adata,
            cipher,
            salt,
            ct,
        }
    }
}

/// Parameter used to encrypt a block.
#[derive(Debug, Deserialize)]
pub struct SjclParams {
    pub iv: Vec<u8>,
    pub v: u32,
    pub iter: u32,
    pub ks: usize,
    pub ts: usize,
    pub mode: String,
    pub adata: Vec<u8>,
    pub cipher: String,
    pub salt: Vec<u8>,
}

pub type AesCcm256 = Ccm<Aes256, U8, U13>;
pub type AesCcm128 = Ccm<Aes128, U8, U13>;
pub type AesCcm192 = Ccm<Aes192, U8, U13>;

/// Utility function to trim the initialization vector to the proper size of
/// the nonce.
/// (See: [SJCL/core.ccm.js](https://github.com/bitwiseshiftleft/sjcl/blob/master/core/ccm.js#L61))
pub fn truncate_iv(mut iv: Vec<u8>, output_size: usize, tag_size: usize) -> Vec<u8> {
    let iv_size = iv.len();
    let output_size = (output_size - tag_size) / 8;

    let mut l = 2;
    while l < 4 && ((output_size >> (8 * l)) > 0) {
        l += 1
    }
    if iv_size <= 15 && l < 15 - iv_size {
        l = 15 - iv_size
    }

    let _ = iv.split_off(15 - l);
    iv
}

/// https://bitwiseshiftleft.github.io/sjcl/demo/
#[cfg(test)]
mod tests {
    use crate::decryption::{decrypt, decrypt_json};
    use crate::encryption::encrypt;
    use crate::{SjclBlock, SjclParams};

    use serde_json;

    #[test]
    fn test_decrypt_256bit_end_to_end() {
        let data = "{\"iv\":\"nJu7KZF2eEqMv403U2oc3w==\", \"v\":1, \"iter\":10000, \"ks\":256, \"ts\":64, \"mode\":\"ccm\", \"adata\":\"\", \"cipher\":\"aes\", \"salt\":\"mMmxX6SipEM=\", \"ct\":\"VwnKwpW1ah5HmdvwuFBthx0=\"}".to_string();
        let password_phrase = "abcdefghi".to_string();

        let plaintext = "test\ntest".to_string();

        assert_eq!(
            String::from_utf8(decrypt_json(data, password_phrase, None).unwrap()).unwrap(),
            plaintext
        );
    }

    #[test]
    fn test_decrypt_256bit_with_struct() {
        let data = SjclBlock {
            iv: "nJu7KZF2eEqMv403U2oc3w".to_string(),
            v: 1,
            iter: 10000,
            ks: 256,
            ts: 64,
            mode: "ccm".to_string(),
            adata: "".to_string(),
            cipher: "aes".to_string(),
            salt: "mMmxX6SipEM".to_string(),
            ct: "VwnKwpW1ah5HmdvwuFBthx0=".to_string(),
        };
        let password_phrase = "abcdefghi".to_string();

        let plaintext = "test\ntest".to_string();

        assert_eq!(
            String::from_utf8(decrypt(data, password_phrase, None).unwrap()).unwrap(),
            plaintext
        );
    }

    #[test]
    fn test_decrypt_192bit_end_to_end() {
        let data = "{\"iv\":\"rUeOzcoSOAmbJIZ4o7wZzA==\", \"v\":1, \"iter\":1000, \"ks\":192, \"ts\":64, \"mode\":\"ccm\", \"adata\":\"\", \"cipher\":\"aes\", \"salt\":\"qpVeWJh4g1I=\", \"ct\":\"QJx31ojP+TW25eYZSFnjrG85dOZY\"}".to_string();
        let password_phrase = "abcdefghi".to_string();

        let plaintext = "cats are cute".to_string();

        assert_eq!(
            String::from_utf8(decrypt_json(data, password_phrase, None).unwrap()).unwrap(),
            plaintext
        );
    }

    #[test]
    fn test_decrypt_192bit_with_struct() {
        let data = SjclBlock {
            iv: "rUeOzcoSOAmbJIZ4o7wZzA==".to_string(),
            v: 1,
            iter: 1000,
            ks: 192,
            ts: 64,
            mode: "ccm".to_string(),
            adata: "".to_string(),
            cipher: "aes".to_string(),
            salt: "qpVeWJh4g1I=".to_string(),
            ct: "QJx31ojP+TW25eYZSFnjrG85dOZY".to_string(),
        };
        let password_phrase = "abcdefghi".to_string();

        let plaintext = "cats are cute".to_string();

        assert_eq!(
            String::from_utf8(decrypt(data, password_phrase, None).unwrap()).unwrap(),
            plaintext
        );
    }

    #[test]
    fn test_decrypt_128bit_end_to_end() {
        let data = "{\"iv\":\"aDvOWpwgcF0S7YDvu3TrTQ==\", \"v\":1, \"iter\":1000, \"ks\":128, \"ts\":64, \"mode\":\"ccm\", \"adata\":\"\", \"cipher\":\"aes\", \"salt\":\"qpVeWJh4g1I=\", \"ct\":\"3F6gxac5V5k39iUNHubqEOHrxuZJqoX2zyws9nU=\"}".to_string();
        let password_phrase = "abcdefghi".to_string();

        let plaintext = "but dogs are the best".to_string();

        assert_eq!(
            String::from_utf8(decrypt_json(data, password_phrase, None).unwrap()).unwrap(),
            plaintext
        );
    }

    #[test]
    fn test_decrypt_128bit_with_struct() {
        let data = SjclBlock {
            iv: "aDvOWpwgcF0S7YDvu3TrTQ==".to_string(),
            v: 1,
            iter: 1000,
            ks: 128,
            ts: 64,
            mode: "ccm".to_string(),
            adata: "".to_string(),
            cipher: "aes".to_string(),
            salt: "qpVeWJh4g1I=".to_string(),
            ct: "3F6gxac5V5k39iUNHubqEOHrxuZJqoX2zyws9nU=".to_string(),
        };
        let password_phrase = "abcdefghi".to_string();

        let plaintext = "but dogs are the best".to_string();

        assert_eq!(
            String::from_utf8(decrypt(data, password_phrase, None).unwrap()).unwrap(),
            plaintext
        );
    }

    #[test]
    fn test_encrypt_128bit() {
        let iv = vec![
            0x0D, 0xAE, 0xA3, 0xA7, 0xD0, 0x03, 0x76, 0x7F, 0x3D, 0xE0, 0x65, 0x16, 0xC3, 0x6E,
            0x03, 0x50,
        ];
        let v = 1;
        let iter = 1000;
        let ks = 128;
        let ts = 64;
        let mode = "ccm".to_string();
        let adata = vec![];
        let cipher = "aes".to_string();
        let salt = vec![0x8B, 0x06, 0x8C, 0x13, 0xD4, 0x45, 0x34, 0xE6];
        let params = SjclParams {
            iv: iv.clone(),
            v: v.clone(),
            iter: iter.clone(),
            ks: ks.clone(),
            ts: ts.clone(),
            mode: mode.clone(),
            adata: adata.clone(),
            cipher: cipher.clone(),
            salt: salt.clone(),
        };
        let plaintext = "everybody loves cute dogs";
        let password = "super_secret_password".to_string();
        let expected = "{\"iv\":\"Da6jp9ADdn894GUWw24DUA==\", \"v\":1, \"iter\":1000, \"ks\":128, \"ts\":64, \"mode\":\"ccm\", \"adata\":\"\", \"cipher\":\"aes\", \"salt\":\"iwaME9RFNOY=\", \"ct\":\"OtTxhmTDYC2hRoICx6M6wDvhJPnNPHSGyxnri7gvxSHx\"}";

        let result_block = encrypt(plaintext.as_bytes().to_vec(), params, password);
        assert_eq!(
            result_block.unwrap(),
            serde_json::from_str(&expected).unwrap()
        );
    }

    #[test]
    fn test_encrypt_192bit() {
        let iv = vec![
            0x0D, 0xAE, 0xA3, 0xA7, 0xD0, 0x03, 0x76, 0x7F, 0x3D, 0xE0, 0x65, 0x16, 0xC3, 0x6E,
            0x03, 0x50,
        ];
        let v = 1;
        let iter = 1000;
        let ks = 192;
        let ts = 64;
        let mode = "ccm".to_string();
        let adata = vec![];
        let cipher = "aes".to_string();
        let salt = vec![0x8B, 0x06, 0x8C, 0x13, 0xD4, 0x45, 0x34, 0xE6];
        let params = SjclParams {
            iv: iv.clone(),
            v: v.clone(),
            iter: iter.clone(),
            ks: ks.clone(),
            ts: ts.clone(),
            mode: mode.clone(),
            adata: adata.clone(),
            cipher: cipher.clone(),
            salt: salt.clone(),
        };
        let plaintext = "kate loves to cuddle with dogs";
        let password = "super_secret_password".to_string();
        let expected = "{\"iv\":\"Da6jp9ADdn894GUWw24DUA==\", \"v\":1, \"iter\":1000, \"ks\":192, \"ts\":64, \"mode\":\"ccm\", \"adata\":\"\", \"cipher\":\"aes\", \"salt\":\"iwaME9RFNOY=\", \"ct\":\"Qz5UG1Vc6Gv46tF9Dd4inj+NS7tu15JQaThn4zS49vlJoW94rj0=\"}";

        let result_block = encrypt(plaintext.as_bytes().to_vec(), params, password);
        assert_eq!(
            result_block.unwrap(),
            serde_json::from_str(&expected).unwrap()
        );
    }

    #[test]
    fn test_encrypt_256bit() {
        let iv = vec![
            0x0D, 0xAE, 0xA3, 0xA7, 0xD0, 0x03, 0x76, 0x7F, 0x3D, 0xE0, 0x65, 0x16, 0xC3, 0x6E,
            0x03, 0x50,
        ];
        let v = 1;
        let iter = 1000;
        let ks = 256;
        let ts = 64;
        let mode = "ccm".to_string();
        let adata = vec![];
        let cipher = "aes".to_string();
        let salt = vec![0x8B, 0x06, 0x8C, 0x13, 0xD4, 0x45, 0x34, 0xE6];
        let params = SjclParams {
            iv: iv.clone(),
            v: v.clone(),
            iter: iter.clone(),
            ks: ks.clone(),
            ts: ts.clone(),
            mode: mode.clone(),
            adata: adata.clone(),
            cipher: cipher.clone(),
            salt: salt.clone(),
        };
        let plaintext = "why sleep when you can mope around and drink lotsa coffee";
        let password = "super_secret_password".to_string();
        let expected = "{\"iv\":\"Da6jp9ADdn894GUWw24DUA==\", \"v\":1, \"iter\":1000, \"ks\":256, \"ts\":64, \"mode\":\"ccm\", \"adata\":\"\", \"cipher\":\"aes\", \"salt\":\"iwaME9RFNOY=\", \"ct\":\"ah/9K1ngL1FO62yGoInnFAcD0bXdJ53K9Bqr4J28K5WpXu70pdABhZBr2pdJ5LSI0ni+KkQP/Y3UmHVEWA3PcFU=\"}";

        let result_block = encrypt(plaintext.as_bytes().to_vec(), params, password);
        assert_eq!(
            result_block.unwrap(),
            serde_json::from_str(&expected).unwrap()
        );
    }

    #[test]
    fn test_encrypt_then_decrypt_128() {
        let iv = vec![
            0x0D, 0xAE, 0xA3, 0xA7, 0xD0, 0x03, 0x76, 0x7F, 0x3D, 0xE0, 0x65, 0x16, 0xC3, 0x6E,
            0x03, 0x50,
        ];
        let v = 1;
        let iter = 1000;
        let ks = 128;
        let ts = 64;
        let mode = "ccm".to_string();
        let adata: Vec<u8> = vec![];
        let cipher = "aes".to_string();
        let salt = vec![0x8B, 0x06, 0x8C, 0x13, 0xD4, 0x45, 0x34, 0xE6];
        let params = SjclParams {
            iv: iv.clone(),
            v: v.clone(),
            iter: iter.clone(),
            ks: ks.clone(),
            ts: ts.clone(),
            mode: mode.clone(),
            adata: adata.clone(),
            cipher: cipher.clone(),
            salt: salt.clone(),
        };

        let plaintext = "the answer is 42!";
        let password = "super_secret_password".to_string();

        let encrypted = encrypt(plaintext.as_bytes().to_vec(), params, password.clone()).unwrap();
        let decrypted =
            decrypt(encrypted, password, Some(String::from_utf8(adata).unwrap())).unwrap();

        assert_eq!(plaintext, String::from_utf8(decrypted).unwrap());
    }

    #[test]
    fn test_encrypt_then_decrypt_192() {
        let iv = vec![
            0x0D, 0xAE, 0xA3, 0xA7, 0xD0, 0x03, 0x76, 0x7F, 0x3D, 0xE0, 0x65, 0x16, 0xC3, 0x6E,
            0x03, 0x50,
        ];
        let v = 1;
        let iter = 1000;
        let ks = 192;
        let ts = 64;
        let mode = "ccm".to_string();
        let adata: Vec<u8> = vec![];
        let cipher = "aes".to_string();
        let salt = vec![0x8B, 0x06, 0x8C, 0x13, 0xD4, 0x45, 0x34, 0xE6];
        let params = SjclParams {
            iv: iv.clone(),
            v: v.clone(),
            iter: iter.clone(),
            ks: ks.clone(),
            ts: ts.clone(),
            mode: mode.clone(),
            adata: adata.clone(),
            cipher: cipher.clone(),
            salt: salt.clone(),
        };

        let plaintext = "the answer is 42!";
        let password = "super_secret_password".to_string();

        let encrypted = encrypt(plaintext.as_bytes().to_vec(), params, password.clone()).unwrap();
        let decrypted =
            decrypt(encrypted, password, Some(String::from_utf8(adata).unwrap())).unwrap();

        assert_eq!(plaintext, String::from_utf8(decrypted).unwrap());
    }

    #[test]
    fn test_encrypt_then_decrypt_256() {
        let iv = vec![
            0x0D, 0xAE, 0xA3, 0xA7, 0xD0, 0x03, 0x76, 0x7F, 0x3D, 0xE0, 0x65, 0x16, 0xC3, 0x6E,
            0x03, 0x50,
        ];
        let v = 1;
        let iter = 1000;
        let ks = 256;
        let ts = 64;
        let mode = "ccm".to_string();
        let adata: Vec<u8> = vec![];
        let cipher = "aes".to_string();
        let salt = vec![0x8B, 0x06, 0x8C, 0x13, 0xD4, 0x45, 0x34, 0xE6];
        let params = SjclParams {
            iv: iv.clone(),
            v: v.clone(),
            iter: iter.clone(),
            ks: ks.clone(),
            ts: ts.clone(),
            mode: mode.clone(),
            adata: adata.clone(),
            cipher: cipher.clone(),
            salt: salt.clone(),
        };

        let plaintext = "the answer is 42!";
        let password = "super_secret_password".to_string();

        let encrypted = encrypt(plaintext.as_bytes().to_vec(), params, password.clone()).unwrap();
        let decrypted =
            decrypt(encrypted, password, Some(String::from_utf8(adata).unwrap())).unwrap();

        assert_eq!(plaintext, String::from_utf8(decrypted).unwrap());
    }
}
