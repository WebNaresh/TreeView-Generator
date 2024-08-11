import * as vscode from "vscode";
import { DirectoryTreeExtension } from "./DirectoryTreeExntesion";

export function activate(context: vscode.ExtensionContext) {
  new DirectoryTreeExtension(context);
}

export function deactivate() {}
