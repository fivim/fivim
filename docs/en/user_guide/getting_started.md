# Getting started

Download and install `enassi`, set the necessary information in the `setup wizard` when you run it for the first time. 

The master password will be used to encrypt all your data, it is very important.

Editor function:

- Image: you can paste images into editor, it will be encoded as base64.
- Attachment: under developing.

## Data directory

- `The main configure file` is in your home directory `.enassi/conf.bin`, its content has been encrypted.
  - on Windows is: `C:\Users\YOUR_USER_NAME\.enassi\conf.bin`
  - on Linux is: `~/.enassi/conf.bin`
  - on MacOS is: `~/.enassi/conf.bin`

- `The startup configuration` and main configuration file is in the same directory, with the file name `conf.startup.bin`.

- `The user data directory` is set by yourself in `Setup wizard`.There will be several subdirectories in the working directory, and the directory names are encrypted.
