// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { FilterViewProvider as FilterViewProvider, loadProblems } from './filterView';
import { ProblemDataProvider } from './problemManager';
import { globalCache } from './infrastructure/cache/globalCache';
import { logger } from './infrastructure/log/logger';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // 使用输出通道记录日志
    logger.info('Congratulations, your extension "codetrack" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposableTest = vscode.commands.registerCommand('codetrack.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from codetrack!');
    });

    context.subscriptions.push(disposableTest);

    // 初始化设置
    globalCache.workspacepath = (vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : context.extensionPath) + "/";

    // 加载数据 
    loadProblems(globalCache.workspacepath + globalCache.problemDir);

    // 注册 WebviewView
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('filterView', new FilterViewProvider(context))
    );

    // 添加 TreeView 提供者
    const problemDataProvider = new ProblemDataProvider(context);
    const problemTreeView = vscode.window.createTreeView('problemListView', { treeDataProvider: problemDataProvider, showCollapseAll: true });
    context.subscriptions.push(problemTreeView);
}

// This method is called when your extension is deactivated
export function deactivate() {
    // 使用输出通道记录日志
   logger.info('Your extension "codetrack" is now deactivated.');
}
