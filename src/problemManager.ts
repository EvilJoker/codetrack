import * as vscode from 'vscode';

import { EventManager, FILTEREVENT } from './infrastructure/event/eventManager';
import { globalCache } from './infrastructure/cache/globalCache';
import { Problem } from './infrastructure/model/problem';
import * as fs from 'fs';
import * as path from 'path';
import { STATUS_DONE } from './infrastructure/constants/constants';

export class ProblemDataProvider implements vscode.TreeDataProvider<ProblemItem | CategoryItem> {
    private context: vscode.ExtensionContext;

    private _onDidChangeTreeData: vscode.EventEmitter<ProblemItem | undefined | void> =
        new vscode.EventEmitter<ProblemItem | undefined | void>();

    readonly onDidChangeTreeData: vscode.Event<ProblemItem | undefined | void> = this._onDidChangeTreeData.event;


    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        EventManager.onGlobalEvent(({ type, payload }) => {
            if (type === FILTEREVENT) {
                console.log('TreeView 收到事件：', payload);
                this.refresh(); // 刷新 TreeView
            }
        });
    }

    // 切换某个问题项的状态并刷新树视图
    toggleProblemStatus(problem: ProblemItem) {
        // 更新 全局标记
        globalCache.bookProblemName = problem.name;
        globalCache.bookCategoryName = problem.category;

        this._onDidChangeTreeData.fire();  // 刷新树
    }

    getTreeItem(element: ProblemItem | CategoryItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ProblemItem | CategoryItem): Thenable<(ProblemItem | CategoryItem)[]> {
        if (element instanceof CategoryItem) {

            // 如果当前元素是 CategoryItem，则返回该分类下的题目
            return Promise.resolve(element.problems.map(problem => new ProblemItem(
                problem.name,
                problem.description,
                problem.description_zh,
                problem.meta,
                problem.info,
                problem.tags,
                problem.filePath,
                problem.category
            )));
        } else {
            // 根据 category 分组问题列表
            const categorizedProblems = globalCache.problems.reduce((acc, problem) => {
                if (!acc[problem.category]) {
                    acc[problem.category] = [];
                }
                acc[problem.category].push(problem);
                return acc;
            }, {} as { [key: string]: Problem[] });

            // 创建 CategoryItem 节点
            return Promise.resolve(Object.keys(categorizedProblems).map(category => new CategoryItem(category, categorizedProblems[category])));
        }
    }

    private refresh() {
        // 触发 getChildren 函数
        this._onDidChangeTreeData.fire();
    }


}

export class CategoryItem extends vscode.TreeItem {
    constructor(
        public readonly name: string,
        public readonly problems: Problem[],
        public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
    ) {
        let count = 0;
        problems.map(problem => {
            if (problem.info.status === STATUS_DONE) {
                count++;
            }
        });

        let label = name + `  done/all: ${count}/${problems.length} `;
        super(label, collapsibleState);
        this.contextValue = 'CategoryItem'; // 添加 contextValue

         // 设置状态图标
         if (globalCache.bookCategoryName === this.name) {
            this.iconPath = new vscode.ThemeIcon('bookmark', new vscode.ThemeColor('charts.orange'));
        }
    }
}

export class ProblemItem extends vscode.TreeItem {
    constructor(
        public readonly name: string,
        public readonly description_info: string,
        public readonly description_info_zh: string,
        public readonly meta: { difficulty: string, recommend: string },
        public readonly info: { updateTime: string, status: string },
        public readonly tags: string[],
        public readonly filePath: string,
        public readonly category: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None
    ) {
        // label + description 会被用来展示
        super(name.slice(0, 20), collapsibleState);
        this.description = `${this.meta.difficulty.slice(0, 4).padEnd(4, ' ')} - ${this.meta.recommend.slice(0, 4).padEnd(4, ' ')} - ${this.info.status.slice(0, 5).padEnd(5, ' ')} - ${this.info.updateTime.slice(0, 10).padEnd(10, ' ')}`;
        this.tooltip = `${this.description_info_zh} - ${this.tags}`;
        this.contextValue = 'ProblemItem'; // 添加 contextValue

        // 设置状态图标
        if (globalCache.bookProblemName === this.name) {
            this.iconPath = new vscode.ThemeIcon('bookmark', new vscode.ThemeColor('charts.orange'));
        }else if (info.status === 'done') {
            this.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
        }else if (info.status === 'doing') {
            this.iconPath = new vscode.ThemeIcon('edit', new vscode.ThemeColor('charts.yellow'));
        } else {
            this.iconPath = new vscode.ThemeIcon('compass');
        }
    }

}
