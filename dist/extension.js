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
const problemManager_1 = __webpack_require__(4);
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
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
    // 添加 TreeView 提供者
    const problemDataProvider = new problemManager_1.ProblemDataProvider(context);
    const problemTreeView = vscode.window.createTreeView('problemListView', { treeDataProvider: problemDataProvider, showCollapseAll: true });
    context.subscriptions.push(problemTreeView);
}
// This method is called when your extension is deactivated
function deactivate() { }


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("path");

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
exports.ProblemItem = exports.ProblemDataProvider = void 0;
exports.loadProblems = loadProblems;
const vscode = __importStar(__webpack_require__(1));
const fs = __importStar(__webpack_require__(2));
const path = __importStar(__webpack_require__(3));
class ProblemDataProvider {
    context;
    constructor(context) {
        this.context = context;
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            return Promise.resolve([]);
        }
        else {
            const problems = loadProblems(this.context.extensionPath);
            return Promise.resolve(problems.map(problem => new ProblemItem(problem.name, problem.description, problem.description_zh, problem.meta, problem.info, problem.tags)));
        }
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
function loadProblems(extensionPath) {
    const problems = [];
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
    }
    else {
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