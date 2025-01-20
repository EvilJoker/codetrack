import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { EventManager, FILTEREVENT } from './infrastructure/event/eventManager';
import { globalCache } from './infrastructure/cache/globalCache';
import { DIFFICULTY_EASY, DIFFICULTY_HARD, DIFFICULTY_MEDIUM, RECOMMEND_BASIC, RECOMMEND_CHALLENGE, RECOMMEND_NEED, STATUS_DOING, STATUS_DONE, STATUS_PLAN } from './infrastructure/constants/constants';

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
            const problems = loadProblems(this.context.extensionPath);
            // 根据 filters 过滤问题列表
            return Promise.resolve(problems.map(problem => new ProblemItem(
                problem.name,
                problem.description,
                problem.description_zh,
                problem.meta,
                problem.info,
                problem.tags
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
        public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None
    ) {

        // label + description 会被用来展示
        super(name, collapsibleState);
        this.description = `${this.meta.difficulty} - ${this.meta.recommend} - ${this.info.status} `;
        this.tooltip = `${this.description_info_zh} - ${this.info.updateTime} - ${this.tags}`;
    }
}

export function loadProblems(extensionPath: string): any[] {
    const problems: any[] = [];
    const problemListPath = path.join(extensionPath, 'problems');
    if (fs.existsSync(problemListPath)) {
        const files = fs.readdirSync(problemListPath);
        files.forEach(file => {
            const filePath = path.join(problemListPath, file, 'meta.json');
            if (fs.existsSync(filePath)) {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const problem = JSON.parse(fileContent);
                // 修改问题对象以匹配新的数据结构
                problems.push({
                    name: problem.name,
                    name_zh: problem.name_zh,
                    description: problem.description,
                    description_zh: problem.description_zh,
                    meta: problem.meta,
                    info: problem.info,
                    tags: problem.tags
                });
            }
        });
    } else {
        // 添加默认的问题列表，修改以匹配新的数据结构
        problems.push({
            name: "问题1",
            name_zh: "问题1",
            description: "这是问题1的描述",
            description_zh: "这是问题1的描述",
            meta: { difficulty: DIFFICULTY_EASY, recommend: RECOMMEND_BASIC },
            info: { updateTime: "2023-10-01T12:00:00Z", status: STATUS_PLAN },
            tags: ["数组"]
        });
        problems.push({
            name: "问题2",
            name_zh: "问题2",
            description: "这是问题2的描述",
            description_zh: "这是问题2的描述",
            meta: { difficulty: DIFFICULTY_MEDIUM, recommend: RECOMMEND_NEED },
            info: { updateTime: "2023-10-01T12:00:00Z", status: STATUS_PLAN },
            tags: ["数组", "哈希表"]
        });
        problems.push({
            name: "问题3",
            name_zh: "问题3",
            description: "这是问题3的描述",
            description_zh: "这是问题3的描述",
            meta: { difficulty: DIFFICULTY_HARD, recommend: RECOMMEND_CHALLENGE },
            info: { updateTime: "2023-10-01T12:00:00Z", status: STATUS_PLAN },
            tags: ["数组"]
        });
        problems.push({
            name: "问题4",
            name_zh: "问题4",
            description: "这是问题4的描述",
            description_zh: "这是问题4的描述",
            meta: { difficulty: DIFFICULTY_EASY, recommend: RECOMMEND_BASIC },
            info: { updateTime: "2023-10-01T12:00:00Z", status: STATUS_PLAN },
            tags: ["数组"]
        });
        problems.push({
            name: "问题5",
            name_zh: "问题5",
            description: "这是问题5的描述",
            description_zh: "这是问题5的描述",
            meta: { difficulty: DIFFICULTY_MEDIUM, recommend: RECOMMEND_NEED },
            info: { updateTime: "2023-10-01T12:00:00Z", status: STATUS_PLAN },
            tags: ["数组", "哈希表"]
        });
    }


    // 根据 globalCache.filters 过滤问题列表
    const filteredProblems = problems.filter(problem => {
        return (globalCache.filters.recommend_basic || problem.meta.recommend !== RECOMMEND_BASIC) &&
            (globalCache.filters.recommend_need || problem.meta.recommend !== RECOMMEND_NEED) &&
            (globalCache.filters.recommend_challenge || problem.meta.recommend !== RECOMMEND_CHALLENGE) &&
            (globalCache.filters.status_plan || problem.info.status !== STATUS_PLAN) &&
            (globalCache.filters.status_doing || problem.info.status !== STATUS_DOING) &&
            (globalCache.filters.status_done || problem.info.status !== STATUS_DONE) &&
            (globalCache.filters.difficulty_easy || problem.meta.difficulty !== DIFFICULTY_EASY) &&
            (globalCache.filters.difficulty_mid || problem.meta.difficulty !== DIFFICULTY_MEDIUM) &&
            (globalCache.filters.difficulty_hard || problem.meta.difficulty !== DIFFICULTY_HARD);
    });

    return filteredProblems;
}