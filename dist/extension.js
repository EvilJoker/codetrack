/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(__webpack_require__(1));
const filterView_1 = __webpack_require__(2);
const problemManager_1 = __webpack_require__(8);
const globalCache_1 = __webpack_require__(5);
const logger_1 = __webpack_require__(9);
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // 使用输出通道记录日志
    logger_1.logger.info('Congratulations, your extension "codetrack" is now active!');
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
    globalCache_1.globalCache.workspacepath = (vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : context.extensionPath) + "/";
    // 加载数据 
    (0, filterView_1.loadProblems)(globalCache_1.globalCache.workspacepath + globalCache_1.globalCache.problemDir);
    // 注册 WebviewView
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('filterView', new filterView_1.FilterViewProvider(context)));
    // 添加 TreeView 提供者
    const problemDataProvider = new problemManager_1.ProblemDataProvider(context);
    const problemTreeView = vscode.window.createTreeView('problemListView', { treeDataProvider: problemDataProvider, showCollapseAll: true });
    context.subscriptions.push(problemTreeView);
}
// This method is called when your extension is deactivated
function deactivate() {
    // 使用输出通道记录日志
    logger_1.logger.info('Your extension "codetrack" is now deactivated.');
}


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FilterViewProvider = void 0;
exports.loadProblems = loadProblems;
const vscode = __importStar(__webpack_require__(1));
const fs = __importStar(__webpack_require__(3));
const eventManager_1 = __webpack_require__(4);
const globalCache_1 = __webpack_require__(5);
const constants_1 = __webpack_require__(6);
const path_1 = __importDefault(__webpack_require__(7));
const logger_1 = __webpack_require__(9);
class FilterViewProvider {
    _extensionContext;
    static viewType = 'filterView';
    _view;
    // 新增全局变量 filters，并初始化为默认值
    constructor(_extensionContext) {
        this._extensionContext = _extensionContext;
    }
    resolveWebviewView(webviewView, context, token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
        };
        // 设置 HTML 内容
        webviewView.webview.html = this.getHtmlForWebview();
        // 监听刷新命令
        vscode.commands.registerCommand('codetrack.refresh_filterView', () => {
            this.refresh();
        });
        // 监听来自 Webview 的消息
        webviewView.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case 'search':
                    // todo 待实现
                    vscode.commands.executeCommand('customTreeView.filterData', message.text);
                    break;
                case 'refreshConfig':
                    this.refreshConfig(message.filters);
                    break;
                case 'updatePath':
                    let dir = message.path.trim();
                    if (dir !== '' && dir !== globalCache_1.globalCache.problemDir) {
                        globalCache_1.globalCache.problemDir = message.path;
                        globalCache_1.globalCache.isInit = true; // 标记路径是否变更
                    }
                    break;
            }
        });
    }
    refresh() {
        // 加载数据
        loadProblems(globalCache_1.globalCache.workspacepath + globalCache_1.globalCache.problemDir);
        // 发送消息给其他视图，让它们自行刷新
        eventManager_1.EventManager.fireEvent(eventManager_1.FILTEREVENT, globalCache_1.globalCache.filters);
    }
    getHtmlForWebview() {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <style>
                body {
                    width: 100%; /* Set width to 100% */
                    height: 10%; /* Set height to 100% */
                    margin: 0;
                    padding: 0;
                }
                .container {
                    padding: 10px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- 添加扫描路径输入框 -->
                <button id="updatePath">更新</button>
                <input type="input" id="scanPath" placeholder="输入相对根目录路径, 比如problems" style="width: 300px;" />
                <hr>
                <label id="scanPathshow">问题路径：${globalCache_1.globalCache.workspacepath}${globalCache_1.globalCache.problemDir}</label>
                <hr>
                <label>推荐：</label>
                <label><input type="checkbox" id="recommend_basic" checked> ${constants_1.RECOMMEND_BASIC_ZH}</label>
                <label><input type="checkbox" id="recommend_need" checked> ${constants_1.RECOMMEND_NEED_ZH}</label>
                <label><input type="checkbox" id="recommend_challenge" checked> ${constants_1.RECOMMEND_CHALLENGE_ZH}</label>
                <br>
                <label>状态：</label>
                <label><input type="checkbox" id="status_plan" checked> ${constants_1.STATUS_PLAN_ZH}</label>
                <label><input type="checkbox" id="status_doing" checked> ${constants_1.STATUS_DOING_ZH}</label>
                <label><input type="checkbox" id="status_done" checked> ${constants_1.STATUS_DONE_ZH}</label>
                <br>
                <label>难度：</label>
                <label><input type="checkbox" id="difficulty_easy" checked> ${constants_1.DIFFICULTY_EASY_ZH}</label>
                <label><input type="checkbox" id="difficulty_mid" checked> ${constants_1.DIFFICULTY_MEDIUM_ZH}</label>
                <label><input type="checkbox" id="difficulty_hard" checked> ${constants_1.DIFFICULTY_HARD_ZH}</label>
                <br>
                <label>排序：</label>
                <label><input type="radio" name="order" value="ascending" checked > ${constants_1.ORDER_ASC_ZH}</label>
                <label><input type="radio" name="order" value="descending" > ${constants_1.ORDER_DESC_ZH}</label>
                <hr>
                <label>标签：</label>
                ${globalCache_1.globalCache.tags.map(tag => `<label><input type="checkbox" id="tag_${tag}" checked> ${tag}</label>`).join('')}
                <hr>
                <script>
                const vscode = acquireVsCodeApi();

                // 添加事件监听器
                document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
                    input.addEventListener('change', () => {
                        // 收集所有复选框和单选按钮的值
                        const filters = {};
                        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                            filters[checkbox.id] = checkbox.checked;
                        });
                        document.querySelectorAll('input[type="radio"]').forEach(radio => {
                            if (radio.checked) {
                                filters[radio.name] = radio.value;
                            }
                        });
                        vscode.postMessage({ command: 'refreshConfig', filters: filters });
                    });
                });

                // 添加更新路径按钮的事件监听器
                document.getElementById('updatePath').addEventListener('click', () => {
                    const newDir = document.getElementById('scanPath').value;
                    document.getElementById('scanPathshow').textContent = "问题路径：${globalCache_1.globalCache.workspacepath}" + newDir; // 更新 scanPathshow label 的文本内容
                    vscode.postMessage({ command: 'updatePath', path: newDir });
                });
                </script>
            </div>
        </body>
        </html>
    `;
    }
    // 修改 refreshConfig 函数，使其接受一个 map 值并更新 filters 变量
    refreshConfig(filters) {
        globalCache_1.globalCache.filters.recommend_basic = filters.recommend_basic !== undefined ? filters.recommend_basic : true;
        globalCache_1.globalCache.filters.recommend_need = filters.recommend_need !== undefined ? filters.recommend_need : true;
        globalCache_1.globalCache.filters.recommend_challenge = filters.recommend_challenge !== undefined ? filters.recommend_challenge : true;
        globalCache_1.globalCache.filters.status_plan = filters.status_plan !== undefined ? filters.status_plan : true;
        globalCache_1.globalCache.filters.status_doing = filters.status_doing !== undefined ? filters.status_doing : true;
        globalCache_1.globalCache.filters.status_done = filters.status_done !== undefined ? filters.status_done : true;
        globalCache_1.globalCache.filters.difficulty_easy = filters.difficulty_easy !== undefined ? filters.difficulty_easy : true;
        globalCache_1.globalCache.filters.difficulty_mid = filters.difficulty_mid !== undefined ? filters.difficulty_mid : true;
        globalCache_1.globalCache.filters.difficulty_hard = filters.difficulty_hard !== undefined ? filters.difficulty_hard : true;
        globalCache_1.globalCache.filters.order = filters.order !== undefined ? filters.order : constants_1.ORDER_ASC;
        console.log("refreshconfig");
        // 更新 tag
        globalCache_1.globalCache.filtertags = [];
        for (const key in filters) {
            if (key.startsWith('tag_') && filters[key] === true) {
                let tag_value = key.substring(4);
                globalCache_1.globalCache.filtertags.push(tag_value); // 去掉 'tag_' 前缀
            }
        }
        console.log(globalCache_1.globalCache.filtertags);
    }
}
exports.FilterViewProvider = FilterViewProvider;
function loadProblems(problemsPath) {
    const problems = [];
    const problemListPath = problemsPath;
    logger_1.logger.info("path:" + problemListPath);
    if (fs.existsSync(problemListPath)) {
        const files = fs.readdirSync(problemListPath);
        files.forEach(file => {
            const filePath = path_1.default.join(problemListPath, file, 'meta.json');
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
    }
    else {
        // 添加默认的问题列表，修改以匹配新的数据结构
        problems.push({
            name: "问题1",
            name_zh: "问题1",
            description: "这是问题1的描述",
            description_zh: "这是问题1的描述",
            meta: { difficulty: constants_1.DIFFICULTY_EASY, recommend: constants_1.RECOMMEND_BASIC },
            info: { updateTime: "2023-10-01T12:00:00Z", status: constants_1.STATUS_PLAN },
            tags: ["数组"]
        });
        problems.push({
            name: "问题2",
            name_zh: "问题2",
            description: "这是问题2的描述",
            description_zh: "这是问题2的描述",
            meta: { difficulty: constants_1.DIFFICULTY_MEDIUM, recommend: constants_1.RECOMMEND_NEED },
            info: { updateTime: "2023-10-01T12:00:00Z", status: constants_1.STATUS_PLAN },
            tags: ["数组", "哈希表"]
        });
        problems.push({
            name: "问题3",
            name_zh: "问题3",
            description: "这是问题3的描述",
            description_zh: "这是问题3的描述",
            meta: { difficulty: constants_1.DIFFICULTY_HARD, recommend: constants_1.RECOMMEND_CHALLENGE },
            info: { updateTime: "2023-10-01T12:00:00Z", status: constants_1.STATUS_PLAN },
            tags: ["数组"]
        });
        problems.push({
            name: "问题4",
            name_zh: "问题4",
            description: "这是问题4的描述",
            description_zh: "这是问题4的描述",
            meta: { difficulty: constants_1.DIFFICULTY_EASY, recommend: constants_1.RECOMMEND_BASIC },
            info: { updateTime: "2023-10-01T12:00:00Z", status: constants_1.STATUS_PLAN },
            tags: ["数组"]
        });
        problems.push({
            name: "问题5",
            name_zh: "问题5",
            description: "这是问题5的描述",
            description_zh: "这是问题5的描述",
            meta: { difficulty: constants_1.DIFFICULTY_MEDIUM, recommend: constants_1.RECOMMEND_NEED },
            info: { updateTime: "2023-10-01T12:00:00Z", status: constants_1.STATUS_PLAN },
            tags: ["数组", "哈希表"]
        });
    }
    // 提炼所有 problems 中的 tags 形成一个不重复的 tags 列表
    const allTags = getUniqueTags(problems);
    globalCache_1.globalCache.tags = allTags;
    if (globalCache_1.globalCache.isInit) {
        // 第一次初始化
        globalCache_1.globalCache.filtertags = allTags;
        globalCache_1.globalCache.isInit = false;
    }
    // 根据 globalCache.filters 过滤问题列表
    const filteredProblems = problems.filter(problem => {
        return (globalCache_1.globalCache.filters.recommend_basic || problem.meta.recommend !== constants_1.RECOMMEND_BASIC) &&
            (globalCache_1.globalCache.filters.recommend_need || problem.meta.recommend !== constants_1.RECOMMEND_NEED) &&
            (globalCache_1.globalCache.filters.recommend_challenge || problem.meta.recommend !== constants_1.RECOMMEND_CHALLENGE) &&
            (globalCache_1.globalCache.filters.status_plan || problem.info.status !== constants_1.STATUS_PLAN) &&
            (globalCache_1.globalCache.filters.status_doing || problem.info.status !== constants_1.STATUS_DOING) &&
            (globalCache_1.globalCache.filters.status_done || problem.info.status !== constants_1.STATUS_DONE) &&
            (globalCache_1.globalCache.filters.difficulty_easy || problem.meta.difficulty !== constants_1.DIFFICULTY_EASY) &&
            (globalCache_1.globalCache.filters.difficulty_mid || problem.meta.difficulty !== constants_1.DIFFICULTY_MEDIUM) &&
            (globalCache_1.globalCache.filters.difficulty_hard || problem.meta.difficulty !== constants_1.DIFFICULTY_HARD) &&
            (problem.tags.some((tag) => globalCache_1.globalCache.filtertags.includes(tag)));
    });
    logger_1.logger.info("cache:" + JSON.stringify(globalCache_1.globalCache, null, 2));
    logger_1.logger.info("result:" + JSON.stringify(filteredProblems, null, 2));
    // 更新 globalCache.tags
    globalCache_1.globalCache.problems = filteredProblems;
    return filteredProblems;
}
// 新增函数：提炼所有 problems 中的 tags 形成一个不重复的 tags 列表
function getUniqueTags(problems) {
    const tagsSet = new Set();
    problems.forEach(problem => {
        problem.tags.forEach((tag) => {
            tagsSet.add(tag);
        });
    });
    return Array.from(tagsSet);
}


/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 4 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EventManager = exports.FILTEREVENT = void 0;
const vscode = __importStar(__webpack_require__(1));
exports.FILTEREVENT = 'refreshData';
class EventManager {
    static _onGlobalEvent = new vscode.EventEmitter();
    static onGlobalEvent = EventManager._onGlobalEvent.event;
    static fireEvent(type, payload) {
        this._onGlobalEvent.fire({ type, payload });
    }
}
exports.EventManager = EventManager;


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.globalCache = void 0;
const constants_1 = __webpack_require__(6);
exports.globalCache = {
    filters: {
        recommend_basic: true,
        recommend_need: true,
        recommend_challenge: true,
        status_plan: true,
        status_doing: true,
        status_done: true,
        difficulty_easy: true,
        difficulty_mid: true,
        difficulty_hard: true,
        order: constants_1.ORDER_ASC
    },
    tags: [],
    filtertags: [],
    isInit: true, // 是否切换过目录
    problems: [],
    workspacepath: "",
    problemDir: "problems"
};


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ORDER_DESC_ZH = exports.ORDER_DESC = exports.ORDER_ASC_ZH = exports.ORDER_ASC = exports.DIFFICULTY_HARD_ZH = exports.DIFFICULTY_HARD = exports.DIFFICULTY_MEDIUM_ZH = exports.DIFFICULTY_MEDIUM = exports.DIFFICULTY_EASY_ZH = exports.DIFFICULTY_EASY = exports.STATUS_DONE_ZH = exports.STATUS_DONE = exports.STATUS_DOING_ZH = exports.STATUS_DOING = exports.STATUS_PLAN_ZH = exports.STATUS_PLAN = exports.RECOMMEND_CHALLENGE_ZH = exports.RECOMMEND_CHALLENGE = exports.RECOMMEND_NEED_ZH = exports.RECOMMEND_NEED = exports.RECOMMEND_BASIC_ZH = exports.RECOMMEND_BASIC = void 0;
exports.RECOMMEND_BASIC = 'basic';
exports.RECOMMEND_BASIC_ZH = '基础';
exports.RECOMMEND_NEED = 'need';
exports.RECOMMEND_NEED_ZH = '中级';
exports.RECOMMEND_CHALLENGE = 'challenge';
exports.RECOMMEND_CHALLENGE_ZH = '高级';
exports.STATUS_PLAN = 'plan';
exports.STATUS_PLAN_ZH = '计划';
exports.STATUS_DOING = 'doing';
exports.STATUS_DOING_ZH = '进行';
exports.STATUS_DONE = 'done';
exports.STATUS_DONE_ZH = '完成';
exports.DIFFICULTY_EASY = 'easy';
exports.DIFFICULTY_EASY_ZH = '简单';
exports.DIFFICULTY_MEDIUM = 'mid';
exports.DIFFICULTY_MEDIUM_ZH = '中等';
exports.DIFFICULTY_HARD = 'hard';
exports.DIFFICULTY_HARD_ZH = '困难';
exports.ORDER_ASC = 'ascending';
exports.ORDER_ASC_ZH = '升序';
exports.ORDER_DESC = 'descending';
exports.ORDER_DESC_ZH = '降序';


/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 8 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProblemItem = exports.ProblemDataProvider = void 0;
const vscode = __importStar(__webpack_require__(1));
const eventManager_1 = __webpack_require__(4);
const globalCache_1 = __webpack_require__(5);
class ProblemDataProvider {
    context;
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    constructor(context) {
        this.context = context;
        eventManager_1.EventManager.onGlobalEvent(({ type, payload }) => {
            if (type === eventManager_1.FILTEREVENT) {
                console.log('TreeView 收到事件：', payload);
                this.refresh(); // 刷新 TreeView
            }
        });
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            return Promise.resolve([]);
        }
        else {
            // 根据 filters 过滤问题列表
            return Promise.resolve(globalCache_1.globalCache.problems.map(problem => new ProblemItem(problem.name, problem.description, problem.description_zh, problem.meta, problem.info, problem.tags)));
        }
    }
    refresh() {
        // 触发 getChildren 函数
        this._onDidChangeTreeData.fire();
    }
}
exports.ProblemDataProvider = ProblemDataProvider;
class ProblemItem extends vscode.TreeItem {
    name;
    description_info;
    description_info_zh;
    meta;
    info;
    tags;
    collapsibleState;
    constructor(name, description_info, description_info_zh, meta, info, tags, collapsibleState = vscode.TreeItemCollapsibleState.None) {
        // label + description 会被用来展示
        super(name, collapsibleState);
        this.name = name;
        this.description_info = description_info;
        this.description_info_zh = description_info_zh;
        this.meta = meta;
        this.info = info;
        this.tags = tags;
        this.collapsibleState = collapsibleState;
        this.description = `${this.meta.difficulty} - ${this.meta.recommend} - ${this.info.status} `;
        this.tooltip = `${this.description_info_zh} - ${this.info.updateTime} - ${this.tags}`;
    }
}
exports.ProblemItem = ProblemItem;


/***/ }),
/* 9 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.logger = exports.Logger = void 0;
const vscode = __importStar(__webpack_require__(1));
class Logger {
    outputChannel;
    constructor(channelName) {
        this.outputChannel = vscode.window.createOutputChannel(channelName);
    }
    info(message) {
        this.log('INFO', message);
    }
    warn(message) {
        this.log('WARN', message);
    }
    error(message) {
        this.log('ERROR', message);
    }
    log(level, message) {
        const timestamp = new Date().toLocaleTimeString();
        this.outputChannel.appendLine(`[${timestamp}] [${level}] ${message}`);
    }
    show() {
        this.outputChannel.show();
    }
}
exports.Logger = Logger;
// 使用示例
exports.logger = new Logger("codeTrack");


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map