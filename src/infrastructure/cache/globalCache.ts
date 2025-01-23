import { ORDER_ASC } from "../constants/constants";
import { logger } from "../log/logger";
import { Problem } from "../model/problem";
import * as vscode from 'vscode';

export const globalCache = {
    filters:  {
        recommend_basic: true,
        recommend_need: true,
        recommend_challenge: true,
        status_plan: true,
        status_doing: true,
        status_done: true,
        difficulty_easy: true,
        difficulty_mid: true,
        difficulty_hard: true,
        order: ORDER_ASC
    } ,
    tags:[] as string[],
    filtertags:[] as string[],
    isInit: true, // 是否切换过目录
    problems:[] as Problem[],
    workspacepath: "",
    problemDir: "problems"
    
};

export function UpdateGlobalCache(newCache: any): void {
    Object.assign(globalCache, newCache);
}

// 实现 SavetoDb 函数
export function SavetoDb(context: vscode.ExtensionContext) {
    const workspaceState = context.workspaceState;
    workspaceState.update("codetrack_globalcache", globalCache);
    logger.info('update cache to workspaceState!');
}

// 实现 loadFromDb 函数
export function LoadFromDb(context: vscode.ExtensionContext): any {
    const workspaceState = context.workspaceState;
    let cache = workspaceState.get("codetrack_globalcache", null);
    // 不为空时赋值
    if (cache !== null) {
        UpdateGlobalCache(cache);
        return;
    }
    // 为空时，初始化
    // 初始化设置
    globalCache.workspacepath = (vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : context.extensionPath) + "/";
}
