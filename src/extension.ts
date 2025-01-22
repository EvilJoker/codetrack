// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { FilterViewProvider as FilterViewProvider, loadProblems } from './filterView';
import { ProblemDataProvider } from './problemManager';
import { globalCache, updateGlobalCache } from './infrastructure/cache/globalCache';
import { logger } from './infrastructure/log/logger';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
let  intervalId :NodeJS.Timeout ;
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

    // 初始化 WorkspaceState
    loadFromDb(context);

    // 加载数据 
    loadProblems(globalCache.workspacepath + globalCache.problemDir);

    // 注册 WebviewView
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('filterView', new FilterViewProvider(context),
            {
                webviewOptions: {
                    retainContextWhenHidden: true, // 保留 Webview 上下文，即使视图被隐藏
                }
            })
    );

    // 添加 TreeView 提供者
    const problemDataProvider = new ProblemDataProvider(context);
    const problemTreeView = vscode.window.createTreeView('problemListView', { treeDataProvider: problemDataProvider, showCollapseAll: true });
    context.subscriptions.push(problemTreeView);

    // 注册 openProblem 命令
    const disposableOpenProblem = vscode.commands.registerCommand('codetrack.openProblem', (problemItem: any) => {
        if (problemItem && problemItem.filePath) {
            const uri = vscode.Uri.file(problemItem.filePath);
            vscode.commands.executeCommand('revealInExplorer', uri).then(
                () => {
                    logger.info(`Successfully revealed ${problemItem.filePath} in the explorer.`);
                },
                (error) => {
                    logger.error(`Failed to reveal ${problemItem.filePath}:` + error);
                }
            );
        }
    });
    context.subscriptions.push(disposableOpenProblem);

    // 启动一个定时器，每隔 10 秒调用一次 periodicFunction
    intervalId = setInterval(()=>SavetoDb(context), 10000);

}

// This method is called when your extension is deactivated
export function deactivate(context: vscode.ExtensionContext) {
    logger.info('extension "codetrack" is now deactivate!');
    context.subscriptions.push(new vscode.Disposable(() => clearInterval(intervalId)));
}



// 实现 SavetoDb 函数
function SavetoDb(context: vscode.ExtensionContext) {
    const workspaceState = context.workspaceState;
    workspaceState.update("codetrack_globalcache", globalCache);
    logger.info('update cache to workspaceState!');
}

// 实现 loadFromDb 函数
function loadFromDb(context: vscode.ExtensionContext): any {
    const workspaceState = context.workspaceState;
    let cache = workspaceState.get("codetrack_globalcache", null);
    // 不为空时赋值
    if (cache !== null) {
        updateGlobalCache(cache);
        return;
    }
    // 为空时，初始化
    // 初始化设置
    globalCache.workspacepath = (vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : context.extensionPath) + "/";

}
