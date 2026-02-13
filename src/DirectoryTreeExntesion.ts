import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import ignore from "ignore";

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
    
    // Initialize ignore instance
    const ig = ignore();
    
    // Add default skip folders
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
    ig.add(skipFolders);

    // Add .gitignore rules if available
    const gitignorePath = path.join(rootPath, ".gitignore");
    if (fs.existsSync(gitignorePath)) {
      ig.add(fs.readFileSync(gitignorePath, "utf-8"));
    }

    const treeStructure = this.getDirectoryTree(rootPath, ig, rootPath, "", framework);

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
    ig: ReturnType<typeof ignore>,
    rootPath: string,
    indent: string = "",
    framework: string
  ): string {
    const items = fs.readdirSync(dirPath);
    let treeStructure = "";

    items.forEach((item, index) => {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      // Check if item should be ignored
      const relativePath = path.relative(rootPath, itemPath);
      // Append / to directories so 'dir/' pattern matches
      const checkPath = relativePath + (stats.isDirectory() ? "/" : "");
      
      if (ig.ignores(checkPath)) {
        return;
      }

      const isLastItem = index === items.length - 1;
      const prefix = isLastItem ? "└── " : "├── ";
      
      // Add current item to tree
      treeStructure += `${indent}${prefix}${item}\n`;

      // Recurse if directory
      if (stats.isDirectory()) {
         const newIndent = indent + (isLastItem ? "    " : "│   ");
         treeStructure += this.getDirectoryTree(
            itemPath,
            ig,
            rootPath,
            newIndent,
            framework
         );
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
