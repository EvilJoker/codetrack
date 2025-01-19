import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class ProblemDataProvider implements vscode.TreeDataProvider<ProblemItem> {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    getTreeItem(element: ProblemItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ProblemItem): Thenable<ProblemItem[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            const problems = loadProblems(this.context.extensionPath);
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
            meta: { difficulty: "简单", recommend: "初学者" },
            info: { updateTime: "2023-10-01T12:00:00Z", status: "计划" },
            tags: ["数组"]
        });
        problems.push({
            name: "问题2",
            name_zh: "问题2",
            description: "这是问题2的描述",
            description_zh: "这是问题2的描述",
            meta: { difficulty: "中等", recommend: "中级" },
            info: { updateTime: "2023-10-01T12:00:00Z", status: "计划" },
            tags: ["数组", "哈希表"]
        });
        problems.push({
            name: "问题3",
            name_zh: "问题3",
            description: "这是问题3的描述",
            description_zh: "这是问题3的描述",
            meta: { difficulty: "困难", recommend: "高级" },
            info: { updateTime: "2023-10-01T12:00:00Z", status: "计划" },
            tags: ["数组"]
        });
        problems.push({
            name: "问题4",
            name_zh: "问题4",
            description: "这是问题4的描述",
            description_zh: "这是问题4的描述",
            meta: { difficulty: "简单", recommend: "初学者" },
            info: { updateTime: "2023-10-01T12:00:00Z", status: "计划" },
            tags: ["数组"]
        });
        problems.push({
            name: "问题5",
            name_zh: "问题5",
            description: "这是问题5的描述",
            description_zh: "这是问题5的描述",
            meta: { difficulty: "中等", recommend: "中级" },
            info: { updateTime: "2023-10-01T12:00:00Z", status: "计划" },
            tags: ["数组", "哈希表"]
        });
    }
    return problems;
}