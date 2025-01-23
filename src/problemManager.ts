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
        super(name.slice(0, 20), collapsibleState);
        this.description = `${this.meta.difficulty.slice(0, 4).padEnd(4, ' ')} - ${this.meta.recommend.slice(0, 4).padEnd(4, ' ')} - ${this.info.status.slice(0, 5).padEnd(5, ' ')} - ${this.info.updateTime.slice(0, 10).padEnd(10, ' ')}`;
        this.tooltip = `${this.description_info_zh} - ${this.tags}`;

        // 设置状态图标
        if (info.status === 'done') {
            this.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
        }
        else if (info.status === 'doing') {
            this.iconPath = new vscode.ThemeIcon('edit', new vscode.ThemeColor('charts.yellow'));
        } else {
            this.iconPath = new vscode.ThemeIcon('compass');
        }
    }
}
