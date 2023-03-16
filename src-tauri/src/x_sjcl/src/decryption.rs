extern crate base64;

use crate::{AesCcm128, AesCcm192, AesCcm256};
use ccm::KeyInit;
use ccm::aead::{generic_array::GenericArray, Aead};
use ccm::consts::{U16, U24, U32};
use password_hash::{PasswordHasher, SaltString};
use pbkdf2::{Params, Pbkdf2};
use serde_json;

use crate::truncate_iv;
use crate::{SjclBlock, SjclError};

/// Decrypts a chunk of SJCL encrypted JSON with a given passphrase.
/// ```rust
/// let data = "{\"iv\":\"nJu7KZF2eEqMv403U2oc3w==\", \"v\":1, \"iter\":10000, \"ks\":256, \"ts\":64, \"mode\":\"ccm\", \"adata\":\"\", \"cipher\":\"aes\", \"salt\":\"mMmxX6SipEM=\", \"ct\":\"VwnKwpW1ah5HmdvwuFBthx0=\"}".to_string();
/// let password_phrase = "abcdefghi".to_string();
/// let plaintext = sjcl::decrypt_json(data, password_phrase, None).unwrap();
/// assert_eq!("test\ntest".to_string(), String::from_utf8(plaintext).unwrap());
/// ```
// Note: Param key is the password!
pub fn decrypt_json(
    chunk: String,
    key: String,
    adata: Option<String>,
) -> Result<Vec<u8>, SjclError> {
    match serde_json::from_str(&chunk) {
        Ok(chunk) => decrypt(chunk, key, adata),
        Err(_) => {
            return Err(SjclError::DecryptionError {
                message: "Failed to parse JSON".to_string(),
            })
        }
    }
}

/// Decrypts a chunk of SJCL encrypted JSON with a given passphrase.
/// ```rust
/// let data = sjcl::SjclBlock::new(
///   "aDvOWpwgcF0S7YDvu3TrTQ==".to_string(),
///   1,
///   1000,
///   128,
///   64,
///   "ccm".to_string(),
///   "".to_string(),
///   "aes".to_string(),
///   "qpVeWJh4g1I=".to_string(),
///   "3F6gxac5V5k39iUNHubqEOHrxuZJqoX2zyws9nU=".to_string(),
/// );
/// let plaintext = sjcl::decrypt(data, "abcdefghi".to_string(), None).unwrap();
/// assert_eq!("but dogs are the best".to_string(), String::from_utf8(plaintext).unwrap());
/// ```
pub fn decrypt(
    mut chunk: SjclBlock,
    key: String,
    adata: Option<String>,
) -> Result<Vec<u8>, SjclError> {
    match chunk.cipher.as_str() {
        "aes" => {
            match chunk.mode.as_str() {
                "ccm" => {
                    if chunk.v != 1 {
                        return Err(SjclError::DecryptionError {
                            message: "Only version 1 is currently supported".to_string(),
                        });
                    }
                    if let Some(adata) = adata {
                        if adata != chunk.adata {
                            return Err(SjclError::DecryptionError {
                                message: format!(
                                    "Additional data does not match {} != {}",
                                    adata, chunk.adata
                                ),
                            });
                        }
                    } else {
                        if chunk.adata.len() > 0 {
                            return Err(SjclError::DecryptionError {
                                message: "Expected empty additional data".to_string(),
                            });
                        }
                    }

                    let salt = match base64::decode(chunk.salt) {
                        Ok(v) => SaltString::b64_encode(&v),
                        Err(_) => {
                            return Err(SjclError::DecryptionError {
                                message: "Failed to base64 decode salt".to_string(),
                            })
                        }
                    };
                    let salt = match salt {
                        Ok(s) => s,
                        Err(_) => {
                            return Err(SjclError::DecryptionError {
                                message: "Failed to generate salt string".to_string(),
                            })
                        }
                    };
                    let password_hash = Pbkdf2.hash_password_customized(
                        key.as_bytes(),
                        None,
                        None,
                        Params {
                            rounds: chunk.iter,
                            output_length: chunk.ks / 8,
                        },
                        salt.as_salt(),
                    );
                    let password_hash = match password_hash {
                        Ok(pwh) => pwh,
                        Err(_) => {
                            return Err(SjclError::DecryptionError {
                                message: "Failed to generate password hash".to_string(),
                            })
                        }
                    };
                    let password_hash = password_hash.hash.unwrap();

                    // Fix missing padding
                    for _ in 0..(chunk.iv.len() % 4) {
                        chunk.iv.push('=');
                    }
                    for _ in 0..(chunk.ct.len() % 4) {
                        chunk.ct.push('=');
                    }
                    let iv = match base64::decode(chunk.iv) {
                        Ok(v) => v,
                        Err(_) => {
                            return Err(SjclError::DecryptionError {
                                message: "Failed to decode IV".to_string(),
                            })
                        }
                    };
                    let ct = match base64::decode(chunk.ct) {
                        Ok(v) => v,
                        Err(_) => {
                            return Err(SjclError::DecryptionError {
                                message: "Failed to decode ct".to_string(),
                            })
                        }
                    };
                    let iv = truncate_iv(iv, ct.len() * 8, chunk.ts);
                    let nonce = GenericArray::from_slice(iv.as_slice());
                    match chunk.ks {
                        256 => {
                            let key: &GenericArray<u8, U32> =
                                GenericArray::from_slice(password_hash.as_bytes());
                            let cipher = AesCcm256::new(key);
                            let plaintext = match cipher.decrypt(nonce, ct.as_ref()) {
                                Ok(pt) => pt,
                                Err(_) => {
                                    return Err(SjclError::DecryptionError {
                                        message: "Failed to decrypt ciphertext".to_string(),
                                    });
                                }
                            };
                            Ok(plaintext)
                        }
                        192 => {
                            let key: &GenericArray<u8, U24> =
                                GenericArray::from_slice(password_hash.as_bytes());
                            let cipher = AesCcm192::new(key);
                            let plaintext = match cipher.decrypt(nonce, ct.as_ref()) {
                                Ok(pt) => pt,
                                Err(_) => {
                                    return Err(SjclError::DecryptionError {
                                        message: "Failed to decrypt ciphertext".to_string(),
                                    });
                                }
                            };
                            Ok(plaintext)
                        }
                        128 => {
                            let key: &GenericArray<u8, U16> =
                                GenericArray::from_slice(password_hash.as_bytes());
                            let cipher = AesCcm128::new(key);
                            let plaintext = match cipher.decrypt(nonce, ct.as_ref()) {
                                Ok(pt) => pt,
                                Err(_) => {
                                    return Err(SjclError::DecryptionError {
                                        message: "Failed to decrypt ciphertext".to_string(),
                                    });
                                }
                            };
                            Ok(plaintext)
                        }
                        _ => Err(SjclError::NotImplementedError),
                    }
                }
                "ocb2" => Err(SjclError::NotImplementedError),
                _ => Err(SjclError::NotImplementedError),
            }
        }
        _ => Err(SjclError::NotImplementedError),
    }
}
