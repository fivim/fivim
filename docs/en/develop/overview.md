# Overview

## Technology stack

### Backend

- language and framework: rust + [tauri](https://tauri.app)
- responsible for:
  - read / write file
  - decrypt / decrypt
- Encryption Algorithm: [chacha20poly1305](https://crates.io/crates/chacha20poly1305)

### Frontend

- language and framework: typescript + [vue](https://vuejs.org) + vite
- responsible for:    
  - visual function
  - user data synchronization
  - note editor: [editorjs](https://editorjs.io/)
- User interface
  - Framework: [Element Plus](https://element-plus.org)
  - Icon: 
    - Mainly use `@element-plus/icons-vue` 
    - Also use some icons of [@ant-design/icons-vue](https://ant.design/components/icon#list-of-icons)

## Encryption

Default encryption Algorithm is **XChaCha20Poly1305**. Because it saves memory when encrypting large files

Refer [XChaCha20 Encryption vs AES-256: What’s the Difference?](https://nordpass.com/blog/xchacha20-encryption-vs-aes-256/)

### Custom encryption

* Modify the params of **Encryption Algorithm**
  * Modify the **gen_key** and **gen_nonce** function in `src-tauri\src\utils\encrypt.rs`

* Change encryption Algorithm
  * Modify all the **encrypt_xxx** and **decrypt_xxx** function in `src-tauri\src\utils\encrypt.rs`

## Naming methods

- CSS class prefix:`.enas`, like: `.enas-list`
- CSS varable prefix: `--enas-`, like: `--enas-border-color` 
- TS event prefix: `on`, like: `onClickButton`
- TS struct name with a "Info" postfix, like: `StructNameInfo`
- Editor attachments path prefix: `attaches://`, like: `attaches://ebfa511124ae8a7b3f4f0252e846954d`

Time about file and data:

- ctimeUtc: create timestamp(UTC time)
- dtimeUtc: delete timestamp(UTC time)
- mtimeUtc: modify timestamp(UTC time)

## File struct and inner data struct

- [file format](./file_format.md)
- [user data struct](./user_data_struct.md)

## Install from source code

[Install tauri dependencies](https://tauri.app/v1/guides/getting-started/prerequisites)

- Install rust (currently 1.66.1)
- Install nodejs (currently 18.13.0 LTS)
- Install pnpm
- [For other contents, see the guids of tauri](https://tauri.app/v1/guides/getting-started/prerequisites)
- Run `pnpm tauri dev` or `pnpm tauri build` at the end

### Troubleshooting

##### window10 / 11
Install `Microsoft Visual Studio C++ Build Tools`

If get error in powsershell, run `set-executionpolicy remotesigned`.
