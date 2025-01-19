// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ProblemDataProvider } from './problemManager';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "codetrack" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposableTest = vscode.commands.registerCommand('codetrack.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from codetrack!');
	});

	context.subscriptions.push(disposableTest);

    // 添加命令以打开 Webview 面板
    let disposable = vscode.commands.registerCommand('codetrack.openView', async () => {
        const panel = vscode.window.createWebviewPanel(
            'codetrackView',
            'CodeTrack',
            vscode.ViewColumn.One,
            {}
        );

        // 加载 HTML 内容
        panel.webview.html = await getWebviewContent(context);
    });

    context.subscriptions.push(disposable);

    // 添加 TreeView 提供者
    const problemDataProvider = new ProblemDataProvider(context);
    const problemTreeView = vscode.window.createTreeView('problemListView', { treeDataProvider: problemDataProvider, showCollapseAll: true });
    context.subscriptions.push(problemTreeView);

}

async function getWebviewContent(context: vscode.ExtensionContext): Promise<string> {
    const htmlPath = vscode.Uri.file(context.asAbsolutePath('src/panel.html'));
    const htmlContent = await vscode.workspace.fs.readFile(htmlPath);
    return htmlContent.toString();
}

// This method is called when your extension is deactivated
export function deactivate() {}
