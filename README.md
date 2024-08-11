# Directory Tree Generator Extension

A simple Visual Studio Code extension that generates a directory tree structure for your project and saves it to a `Tree.md` file in the root of your workspace. It also detects the framework used in your project and adjusts the directory tree accordingly.

## Video Demonstration

![Directory Tree Generator Extension](https://github.com/user-attachments/assets/f6bd5299-2021-42d9-bfb7-0387624cfa34)

## Requirements

- Make sure to have Node.js installed and added to your system's PATH.
- This extension is primarily designed to work with JavaScript/TypeScript projects.

## Features

- Generates a directory tree structure and saves it to `Tree.md`.
- Detects the framework used in your project (React, Angular, Vue, Flutter, etc.).
- Excludes common build and configuration directories from the tree.
- Provides a status bar item to quickly generate the directory tree.
- Adjustable settings for excluding specific folders.

## Usage

1. Open a workspace in Visual Studio Code.
2. Click on the status bar item labeled `Tree` to generate the directory tree.
3. The directory tree will be saved to a file named `Tree.md` in the root of your workspace.

## Commands

- `extension.generateDirectoryTree`: Generates the directory tree and saves it to `Tree.md`.

## Framework Detection

The extension can detect the following frameworks based on the presence of specific configuration files or scripts in `package.json`:

- React
- Angular
- Vue
- Flutter
- Next.js
- Nuxt.js
- Svelte
- Express
- NestJS
- React Native

## Settings

- `directoryTreeGenerator.excludeFolders`: An array of folder names to exclude from the directory tree. Default values include common build and configuration directories.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
