# Develop

## Naming methods

- CSS class prefix:`.enas`, like: `.enas-list`
- CSS varable prefix: `--enas-`, like: `--enas-border-color` 
- TS event prefix: `on`, like: `onClickButton`
- Editor attachments path prefix: `attaches://`, like: `attaches://ebfa511124ae8a7b3f4f0252e846954d`

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

### git

EOL config: 

[Refer](https://docs.github.com/en/get-started/getting-started-with-git/configuring-git-to-handle-line-endings#about-line-endings)

set a `.gitattributes`  file,

```sh
git config --global core.autocrlf false
git rm --cached -r .
git reset --hard
```

Save your current files in Git, so that none of your work is lost.

```sh
git add . -u
git commit -m "Saving files before refreshing line endings"
```

Add all your changed files back and normalize the line endings.

```sh
git add --renormalize .
```

Show the rewritten, normalized files.

```sh
git status
```

Commit the changes to your repository.

```sh
git commit -m "Normalize all the line endings"
```

check eol: `git ls-files --eol`


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
