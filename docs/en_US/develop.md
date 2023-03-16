# Develop

## Naming methods

- CSS class prefix:`.enas`, like: `.enas-list`
- CSS varable prefix: `--enas-`, like: `--enas-border-color` 
- TS event prefix: `on`, like: `onClickButton`
- Editor attachments path prefix: `attaches://`, like: `attaches://ebfa511124ae8a7b3f4f0252e846954d`

## Technology stack

- Backend: 
  - language: rust  
  - responsible for:
    - read / write file
    - decrypt / decrypt
  - Encryption Algorithm: [chacha20poly1305](https://crates.io/crates/chacha20poly1305)

- Frontend: 
  - language and framework: typescript + vue + vite
  - responsible for:
    - user data synchronization
    - visual function
  - User interface
    - Framework: [Element Plus](https://element-plus.org)
    - Icon: 
      - Mainly use `#element-plus/icons-vue` 
      - Also use some icons of [@ant-design/icons-vue] (https://ant.design/components/icon#list-of-icons)

## File struct and inner data struct
- [file format](./file_format.md)
- [user data struct](./user_data_struct.md)

## Install from source code

[Install tauri dependencies](https://tauri.app/v1/guides/getting-started/prerequisites)

### window10 / 11

- Install rust (currently 1.66.1)
- Install nodejs (currently 18.13.0 LTS)
- Install pnpm
- [For other contents, see the guids of tauri](https://tauri.app/v1/guides/getting-started/prerequisites)
- Run `pnpm tauri dev` at the end

#### Troubleshooting
Install `Microsoft Visual Studio C++ Build Tools`
If get error in powsershell, run `set-executionpolicy remotesigned`.
