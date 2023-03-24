<h1 align="center">
  <img src="./src-tauri/icons/Square150x150Logo.png" width=200 height=200/><br>
  enassi
</h1>


<h4 align="center">Enassi is your data encryption assistant.</h4>

<div align="center">
  <a href="https://github.com/enassi/enassi" target="_blank">
    <img src="https://img.shields.io/github/stars/enassi?style=social" />
  </a>
  <a href="https://github.com/enassi/enassi" target="_blank">
    <img src="https://img.shields.io/github/followers/enassi?style=social" />
  </a>
  <a href="https://github.com/enassi/enassi" target="_blank">
    <img src="https://img.shields.io/github/watchers/enassi/enassi?style=social" />
  </a>
  <a href="https://discord.gg/2yrMRAnV3M" target="_blank">
      <img src="https://img.shields.io/badge/chat-discord-7289da.svg">
  </a>
   <a href="https://opencollective.com/enassi" target="_blank">
      <img src="https://img.shields.io/badge/sponsor-Open%20Collective-blue.svg">
  </a>
</div>

> Note: So far, this project is still under development.

## Features

- 🔒 Encrypt everything, support large file.
- 🙂 Easy to use.
- 💌 Free and open source.
- 💻 Cross-platform.
- 🌐 Multi-language support.
- 🎨 Various themes.
- 🔗 Share the encrypted data with your friends.

The following two screenshots are the **default** theme and the **material** theme. [More themes](./docs/en/themes.md)

| default theme                               | material theme                                |
| ------------------------------------------- | --------------------------------------------- |
| ![default theme](./docs/images/themes/default.png) | ![material theme](./docs/images/themes/material.png) |

## Table of Contents

- [user manual](./docs/en/user_manual.md)
- [themes](./docs/en/themes.md)
- [develop](./docs/en/develop.md)
  - [file format](./docs/en/file_format.md)
  - [user data struct](./docs/en/user_data_struct.md)

## Product positioning 

- Encrypted storage of personal privacy data.
- Do not actively access the network.
- [License](./LICENSE)

## Dante

[open collective](https://opencollective.com/enassi)

### Cryptocurrency

* XMR: 46df6rwnqcUCFaSummLobcH3J9sWgqYASF8Znq5HnhgrLeASh8u4TPJ2LaLnoQk3uV6t18CgNuFVCDfLUR9G94AZUj1TtGr
* SOL: BbrRkLArfTeAieAtDpvBHNE4KBKX9fmbjPb5JDmKHWE7
* ETH: 0xA59186a08424BE262FBacA922E87Ab82F3C5245B

### Platforms

Tauri currently supports development and distribution on the following platforms:

| Platform   | Versions        |
| :--------- | :-------------- |
| Windows    | 7 and above     |
| macOS      | 10.15 and above |
| Linux      | See below       |
| iOS/iPadOS | coming soon     |
| Android    | coming soon     |

#### Linux Support

- Arch
- Debian (Ubuntu 18.04 and above or equivalent)
- Fedora (latest 2 versions)

## Roadmap

[ ] list tag items

[x] log

[ ] change master password

[ ] import / export note data

[ ] optimize the style of emoji-picker 

[ ] show editor outline

[ ] encryption and decryption of selected attachments

[ ] add more language

[ ] sync

[ ] add shortcut key 

[ ] support for custom css files

## FAQ

- Windows 10/11 missing emoji flag support
  - On Windows 10/11, we rely on Edge, currently render flags as letters, not flags. 
  - Firefox has fixed this using their own flag emoji.
  - [more](https://github.com/nolanlawson/emoji-picker-element/issues/269)

- Translation error found
  - Due to the use of automatic translation, there may be some problems, please feedback to us.