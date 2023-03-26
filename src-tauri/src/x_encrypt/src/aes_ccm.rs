use std::convert::TryInto;
use aes::Aes256;
use base64::{engine::general_purpose::STANDARD, Engine};
use ccm::{
    aead::{generic_array::typenum::Unsigned, Aead},
    consts::{U11, U12, U13, U8},
    Ccm, KeyInit,
};
use serde::Deserialize;
use std::str;

use xsjcl::{decrypt_json, encrypt, SjclParams};

// Refer: https://users.rust-lang.org/t/is-there-any-pure-rust-code-to-decrypt-an-aes-ccm-data/90138/2
// Note: Key is not the password.
pub fn decrypt_direct(input: &str, key: &str) -> Vec<u8> {
    #[derive(Deserialize)]
    struct Input {
        iv: String,
        ct: String,
    }

    let input: Input = serde_json::from_str(input).unwrap();
    let iv = STANDARD.decode(input.iv).unwrap();
    let ct = STANDARD.decode(input.ct).unwrap();
    let key: Vec<u8> = key
        .split(" ")
        .flat_map(|chunk| u32::from_str_radix(chunk, 16).unwrap().to_be_bytes())
        .collect();

    fn decrypt_with<Alg: KeyInit + Aead>(key: &[u8], iv: &[u8], ct: &[u8]) -> Vec<u8> {
        Alg::new_from_slice(key)
            .unwrap()
            .decrypt(iv[..Alg::NonceSize::USIZE].try_into().unwrap(), &ct[..])
            .unwrap()
    }

    // SJCL automatically adjusts the nonce size, we must do so manually
    if ct.len() < 0x1_0008 {
        decrypt_with::<Ccm<Aes256, U8, U13>>(&key, &iv, &ct)
    } else if ct.len() < 0x100_0008 {
        decrypt_with::<Ccm<Aes256, U8, U12>>(&key, &iv, &ct)
    } else {
        decrypt_with::<Ccm<Aes256, U8, U11>>(&key, &iv, &ct)
    }
}

#[test]
pub fn test_aes_ccm_decrypt() {
    // use key
    // let input = r#"{
    //     "iv":"7M+yeOE9TaZpW711d8YffA==",
    //     "v":1,
    //     "iter":1000,
    //     "ks":256,
    //     "ts":64,
    //     "mode":"ccm",
    //     "adata":"",
    //     "cipher":"aes",
    //     "salt":"O4ifalzj/Es=",
    //     "ct":"Lsbc3V06Fruulq83CRSiD2dohA=="
    // }"#;
    // let key_hex = "7DED638F DD30ACDB 4A34D153 48F12D95 BB388A7E 8CB9C35B 8D9C9009 89454E1E";
    // let output = decryptDirect(input, key_hex);
    // println!(">>> after decrypt {:?}", str::from_utf8(&output).unwrap());

    // use password
    // content id  "test\ntest"
    // let input = "{\"iv\":\"nJu7KZF2eEqMv403U2oc3w==\", \"v\":1, \"iter\":10000, \"ks\":256, \"ts\":64, \"mode\":\"ccm\", \"adata\":\"\", \"cipher\":\"aes\", \"salt\":\"mMmxX6SipEM=\", \"ct\":\"VwnKwpW1ah5HmdvwuFBthx0=\"}";
    // content id "final countdown"
    let input = r#"
    {
        "iv": "Da6jp9ADdn894GUWw24DUA==", 
        "v": 1, 
        "iter": 1000,
        "ks": 256,
        "ts": 64,
        "mode": "ccm",
        "adata": "", 
        "cipher": "aes", 
        "salt": "iwaME9RFNOY=",
        "ct": "9V5s7GUgPWAdlDT0y8rzgrV2ay+MRSo=" 
    }
     "#;
    let password = "abcdefghi";

    let ddd = match decrypt_json(input.to_string(), password.to_string(), None) {
        Ok(ddd) => ddd,
        Err(e) => {
            print!(">>>  decrypt_json error: {}\n", e);
            return;
        }
    };

    let plaintext = String::from_utf8(ddd);

    println!(">>> after decrypt {:?}", plaintext.unwrap());

    // test encrypt
    let plaintext = "final countdown".as_bytes().to_vec();
    let params = SjclParams {
        iv: vec![
            0x0D, 0xAE, 0xA3, 0xA7, 0xD0, 0x03, 0x76, 0x7F, 0x3D, 0xE0, 0x65, 0x16, 0xC3, 0x6E,
            0x03, 0x50,
        ],
        v: 1,
        iter: 1000,
        ks: 256,
        ts: 64,
        mode: "ccm".to_string(),
        adata: vec![],
        cipher: "aes".to_string(),
        salt: vec![0x8B, 0x06, 0x8C, 0x13, 0xD4, 0x45, 0x34, 0xE6],
    };
    let key = "abcdefghi".to_string();
    let sjcl_block = encrypt(plaintext, params, key);

    println!(">>> after encrypt {:?}", sjcl_block);
}
