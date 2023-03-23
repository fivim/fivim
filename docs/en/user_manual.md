# User Manual

## Getting Started

Download and install the program, please set the necessary information in the setup wizard when you run it for the first time. The master password will be used to encrypt all your data, it is very important and can only be set once (the function of changing the master password will be provided in the future).

Editor function:

- Image: you can paste images into editor, it will be encoded as base64.

## Data directory

- The configure file is in your home directory `.enassi/conf.bin`, its content has been encrypted.
  - on Windows is: `C:\Users\YOUR_USER_NAME\.enassi\conf.bin`
  - on Linux is: `~/.enassi/conf.bin`
  - on MacOS is: `~/.enassi/conf.bin`

- The user data directory is set by yourself in `Setup wizard`.There will be several subdirectories in the working directory, and the directory names are encrypted.

## Desktop
### User Interface

There are some buttons on the top left corner:

- Setting button: Open `settings` dialog.
- Theme button: Change `theme`.
- Save button: `Save current data` right now.
- Synchronization button: `Synchronization` right now.

### Theme and appearance
We provide some built-in themes. Please click the **Theme** button to switch.

#### Customize the background image
Open the `settings` dialog, click the **Appearance** tab, and select a **jpg** format image. 

You can also adjust the opacity.

### Set synchronization

Open the `settings` dialog, click the **Synchronization** tab.

### Set encryption

Open the `settings` dialog, click the **Encryption** tab.

This section is **very very very important**.

If you want to synchronize normally next time, you must fill in the same encryption settings.