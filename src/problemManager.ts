import * as vscode from 'vscode';

import { EventManager, FILTEREVENT } from './infrastructure/event/eventManager';
import { globalCache } from './infrastructure/cache/globalCache';

export class ProblemDataProvider implements vscode.TreeDataProvider<ProblemItem> {
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

    getTreeItem(element: ProblemItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ProblemItem): Thenable<ProblemItem[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            // 根据 filters 过滤问题列表
            return Promise.resolve(globalCache.problems.map(problem => new ProblemItem(
                problem.name,
                problem.description,
                problem.description_zh,
                problem.meta,
                problem.info,
                problem.tags,
                problem.filePath
            )));
        }
    }

    private refresh() {
        // 触发 getChildren 函数
        this._onDidChangeTreeData.fire();
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
        public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None
    ) {

        // label + description 会被用来展示
        super(name, collapsibleState);
        this.description = `${this.meta.difficulty} - ${this.meta.recommend} - ${this.info.status} `;
        this.tooltip = `${this.description_info_zh} - ${this.info.updateTime} - ${this.tags}`;
    }
}
