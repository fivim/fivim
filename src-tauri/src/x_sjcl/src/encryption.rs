extern crate base64;

use crate::truncate_iv;
use crate::{AesCcm128, AesCcm192, AesCcm256};
use crate::{SjclBlock, SjclError, SjclParams};

use ccm::KeyInit;
use ccm::aead::{generic_array::GenericArray, Aead, Payload};
use ccm::consts::{U16, U24, U32};
use password_hash::{PasswordHasher, SaltString};
use pbkdf2::{Params, Pbkdf2};

/// Encrypts a `plaintext` using passed `params` and a password `key`.
/// ```rust
/// let plaintext = "final countdown".as_bytes().to_vec();
/// let params = sjcl::SjclParams{
///     iv: vec![0x0D, 0xAE, 0xA3, 0xA7, 0xD0, 0x03, 0x76, 0x7F, 0x3D, 0xE0, 0x65, 0x16, 0xC3, 0x6E, 0x03, 0x50,],
///     v: 1,
///     iter: 1000,
///     ks: 256,
///     ts: 64,
///     mode: "ccm".to_string(),
///     adata: vec![],
///     cipher: "aes".to_string(),
///     salt: vec![0x8B, 0x06, 0x8C, 0x13, 0xD4, 0x45, 0x34, 0xE6],
/// };
/// let key = "abcdefghi".to_string();
/// let sjcl_block = sjcl::encrypt(plaintext, params, key);
/// ```
pub fn encrypt(
    plaintext: Vec<u8>,
    params: SjclParams,
    key: String,
) -> Result<SjclBlock, SjclError> {
    let iv_b64 = base64::encode(params.iv.clone());
    let adata_b64 = base64::encode(params.adata.clone());
    let salt_b64 = base64::encode(params.salt.clone());

    match params.cipher.as_str() {
        "aes" => match params.mode.as_str() {
            "ccm" => {
                if params.v != 1 {
                    return Err(SjclError::EncryptionError {
                        message: "Only version 1 is currently supported".to_string(),
                    });
                }

                let salt = match SaltString::b64_encode(&params.salt) {
                    Ok(s) => s,
                    Err(_) => {
                        return Err(SjclError::EncryptionError {
                            message: "Failed to generate salt string".to_string(),
                        })
                    }
                };
                let password_hash = Pbkdf2.hash_password_customized(
                    key.as_bytes(),
                    None,
                    None,
                    Params {
                        rounds: params.iter,
                        output_length: params.ks / 8,
                    },
                    salt.as_salt(),
                );
                let password_hash = match password_hash {
                    Ok(pwh) => pwh,
                    Err(_) => {
                        return Err(SjclError::EncryptionError {
                            message: "Failed to generate password hash".to_string(),
                        })
                    }
                };
                let password_hash = password_hash.hash.unwrap();
                let iv = truncate_iv(params.iv, plaintext.len() * 8, params.ts);
                let nonce = GenericArray::from_slice(iv.as_slice());

                let ciphertext = match params.ks {
                    256 => {
                        let key: &GenericArray<u8, U32> =
                            GenericArray::from_slice(password_hash.as_bytes());
                        let cipher = AesCcm256::new(key);
                        match cipher.encrypt(
                            nonce,
                            Payload {
                                aad: &params.adata,
                                msg: &plaintext,
                            },
                        ) {
                            Ok(c) => c,
                            Err(_) => {
                                return Err(SjclError::EncryptionError {
                                    message: "Failed to encrypt ciphertext".to_string(),
                                });
                            }
                        }
                    }
                    192 => {
                        let key: &GenericArray<u8, U24> =
                            GenericArray::from_slice(password_hash.as_bytes());
                        let cipher = AesCcm192::new(key);
                        match cipher.encrypt(
                            nonce,
                            Payload {
                                aad: &params.adata,
                                msg: &plaintext,
                            },
                        ) {
                            Ok(c) => c,
                            Err(_) => {
                                return Err(SjclError::EncryptionError {
                                    message: "Failed to encrypt ciphertext".to_string(),
                                });
                            }
                        }
                    }
                    128 => {
                        let key: &GenericArray<u8, U16> =
                            GenericArray::from_slice(password_hash.as_bytes());
                        let cipher = AesCcm128::new(key);
                        match cipher.encrypt(
                            nonce,
                            Payload {
                                aad: &params.adata,
                                msg: &plaintext,
                            },
                        ) {
                            Ok(c) => c,
                            Err(_) => {
                                return Err(SjclError::EncryptionError {
                                    message: "Failed to encrypt ciphertext".to_string(),
                                });
                            }
                        }
                    }
                    _ => {
                        return Err(SjclError::NotImplementedError);
                    }
                };

                Ok(SjclBlock::new(
                    iv_b64,
                    params.v,
                    params.iter,
                    params.ks,
                    params.ts,
                    params.mode,
                    adata_b64,
                    params.cipher,
                    salt_b64,
                    base64::encode(ciphertext),
                ))
            }
            _ => Err(SjclError::NotImplementedError),
        },
        _ => Err(SjclError::NotImplementedError),
    }
}
