<h3 align="center">EditorJS Markdown Importer/Exporter</h3>

<p align="center">
A plugin which allows the user to export the EditorJS data to Markdown and import it from Markdown.
</p>


## Table of Contents

- [Table of Contents](#table-of-contents)
- [About The Project](#about-the-project)
  - [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)



## About The Project

I intend to use the editor which should be exported/imported from Markdown.

### Built With

* [Remark](https://remark.js.org/)


## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

- yarn

### Installation

1. Clone the repo
```sh
git clone https://github.com/stejul/editorjs-markdown-parser
```
2. Install packages
```sh
yarn
```

## Usage

- Load up the bundled file (`dist/bundle.js`) in you document.
- Add the Importer/Exporter to the EditorJS tools.

```js
const editor = new EditorJS({
    autofocuse: true,
    tools: {
        markdownParser: MDParser,

        markdownImporter: MDImporter,
    },
};
```

***The Plugin can now be used in the Editor-Toolbar***


## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## License

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgements

* [Lukas Gabsi](https://github.com/gabsii) - Helped me with his JS expertise
