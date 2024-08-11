import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

export class DirectoryTreeExtension {
  private myStatusBarItem: vscode.StatusBarItem;

  constructor(private context: vscode.ExtensionContext) {
    this.myStatusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.myStatusBarItem.text = "$(list-tree) Tree";
    this.myStatusBarItem.tooltip = "Click to generate directory tree";
    this.myStatusBarItem.command = "extension.generateDirectoryTree";
    this.myStatusBarItem.show();

    this.registerCommands();
    this.context.subscriptions.push(this.myStatusBarItem);
  }

  private registerCommands() {
    let disposable = vscode.commands.registerCommand(
      "extension.generateDirectoryTree",
      () => {
        this.generateDirectoryTree();
      }
    );
    this.context.subscriptions.push(disposable);
  }

  public async generateDirectoryTree(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showInformationMessage("No workspace folder open.");
      return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const framework = this.detectFramework(rootPath);

    console.log("Directory Tree:");
    const treeStructure = this.getDirectoryTree(rootPath, "", framework);

    const treeFilePath = path.join(rootPath, "Tree.md");
    if (fs.existsSync(treeFilePath)) {
      fs.appendFileSync(treeFilePath, treeStructure);
    } else {
      fs.writeFileSync(treeFilePath, treeStructure);
    }
    vscode.window.showInformationMessage(`Detected Framework: ${framework}`);
  }
  private getDirectoryTree(
    dirPath: string,
    indent: string = "",
    framework: string
  ): string {
    const items = fs.readdirSync(dirPath);
    let skipFolders: string[] = [
      "dist",
      "node_modules",
      "build",
      ".git",
      ".vscode",
      ".github",
      ".yarn",
      ".expo",
      ".firebase",
      ".cache",
      "coverage",
      "public",
      "android",
      "ios",
      "web",
      "windows",
      "macos",
      "linux",
      ".dart_tool",
      ".idea",
      ".vs",
      ".history",
      ".pnp",
      ".bundle",
    ];

    if (framework === "React") {
      skipFolders.push("public");
    } else if (framework === "Angular") {
      skipFolders.push("e2e");
    } else if (framework === "Vue") {
      skipFolders.push("tests");
    } else if (framework === "Flutter") {
      skipFolders.push("build");
    }

    let treeStructure = "";

    items.forEach((item, index) => {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      const isLastItem = index === items.length - 1;
      const prefix = isLastItem ? "└── " : "├── ";
      const newIndent = indent + (isLastItem ? "    " : "│   ");

      if (stats.isDirectory()) {
        if (!skipFolders.includes(item)) {
          treeStructure += `${indent}${prefix}${item}\n`;
          treeStructure += this.getDirectoryTree(
            itemPath,
            newIndent,
            framework
          );
        }
      } else {
        treeStructure += `${indent}${prefix}${item}\n`;
      }
    });

    return treeStructure;
  }

  private detectFramework(rootPath: string): string {
    const flutterConfigPath = path.join(rootPath, "pubspec.yaml");
    if (fs.existsSync(flutterConfigPath)) {
      return "Flutter";
    }

    const packageJsonPath = path.join(rootPath, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      const scripts = packageJson.scripts || {};

      // React
      if (scripts.start && scripts.build && scripts.test) {
        if (scripts.start.includes("react-scripts")) {
          return "React";
        }
      }

      // Next.js
      if (scripts.dev && scripts.build && scripts.start) {
        if (scripts.dev.includes("next") || scripts.start.includes("next")) {
          return "Next.js";
        }
      }

      // Angular
      if (scripts.start && scripts.build && scripts.test) {
        if (scripts.start.includes("ng") || scripts.build.includes("ng")) {
          return "Angular";
        }
      }

      // Vue
      if (scripts.serve && scripts.build) {
        if (
          scripts.serve.includes("vue-cli-service") ||
          scripts.build.includes("vue-cli-service")
        ) {
          return "Vue";
        }
      }

      // Nuxt.js
      if (scripts.dev && scripts.build && scripts.start) {
        if (scripts.dev.includes("nuxt") || scripts.start.includes("nuxt")) {
          return "Nuxt.js";
        }
      }

      // Svelte
      if (scripts.dev && scripts.build) {
        if (
          scripts.dev.includes("svelte") ||
          scripts.build.includes("svelte")
        ) {
          return "Svelte";
        }
      }

      // Express
      if (scripts.start) {
        if (
          scripts.start.includes("node") &&
          !scripts.start.includes("react-scripts")
        ) {
          return "Express";
        }
      }

      // NestJS
      if (scripts.start) {
        if (
          scripts.start.includes("nest") ||
          scripts.start.includes("ts-node")
        ) {
          return "NestJS";
        }
      }

      // React Native
      if (scripts.start) {
        if (
          scripts.start.includes("react-native") ||
          scripts.start.includes("expo")
        ) {
          return "React Native";
        }
      }

      return "Unknown Framework";
    } else {
      return "No Workspace is Open";
    }
  }
}
