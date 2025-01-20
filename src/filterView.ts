import * as vscode from 'vscode';
import { EventManager, FILTEREVENT } from './infrastructure/event/eventManager';
import { globalCache } from './infrastructure/cache/globalCache';
import { DIFFICULTY_EASY_ZH, DIFFICULTY_HARD_ZH, DIFFICULTY_MEDIUM_ZH, ORDER_ASC, ORDER_ASC_ZH, ORDER_DESC_ZH, RECOMMEND_BASIC_ZH, RECOMMEND_CHALLENGE_ZH, RECOMMEND_NEED_ZH, STATUS_DOING, STATUS_DOING_ZH, STATUS_PLAN_ZH } from './infrastructure/constants/constants';

export class FilterViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'filterView';
    private _view?: vscode.WebviewView;
    // 新增全局变量 filters，并初始化为默认值

    constructor(private readonly _extensionContext: vscode.ExtensionContext) {
    }

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        token: vscode.CancellationToken
    ) {
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
            }
        });
 
    }


    private refresh() {
        // 发送消息给其他视图，让它们自行刷新
        EventManager.fireEvent(FILTEREVENT, globalCache.filters);

    }

    private getHtmlForWebview(): string {
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
                    <label>推荐：</label>
                    <label><input type="checkbox" id="recommend_basic" checked> ${RECOMMEND_BASIC_ZH}</label>
                    <label><input type="checkbox" id="recommend_need" checked> ${RECOMMEND_NEED_ZH}</label>
                    <label><input type="checkbox" id="recommend_challenge" checked> ${RECOMMEND_CHALLENGE_ZH}</label>
                    <br>
                    <label>状态：</label>
                    <label><input type="checkbox" id="status_plan" checked> ${STATUS_PLAN_ZH}</label>
                    <label><input type="checkbox" id="status_doing" checked> ${STATUS_DOING_ZH}</label>
                    <label><input type="checkbox" id="status_done" checked> ${STATUS_DOING_ZH}</label>
                    <br>
                    <label>难度：</label>
                    <label><input type="checkbox" id="difficulty_easy" checked> ${DIFFICULTY_EASY_ZH}</label>
                    <label><input type="checkbox" id="difficulty_mid" checked> ${DIFFICULTY_MEDIUM_ZH}</label>
                    <label><input type="checkbox" id="difficulty_hard" checked> ${DIFFICULTY_HARD_ZH}</label>
                    <br>
                    <label>排序：</label>
                    <label><input type="radio" name="order" value="ascending" checked > ${ORDER_ASC_ZH}</label>
                    <label><input type="radio" name="order" value="descending" > ${ORDER_DESC_ZH}</label>
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
                    </script>
                </div>
            </body>
            </html>
        `;
    }

    // 修改 refreshConfig 函数，使其接受一个 map 值并更新 filters 变量
    private refreshConfig(filters: { [key: string]: any }) {
      globalCache.filters.recommend_basic = filters.recommend_basic !== undefined ? filters.recommend_basic : true;
      globalCache.filters.recommend_need = filters.recommend_need !== undefined ? filters.recommend_need : true;
      globalCache.filters.recommend_challenge = filters.recommend_challenge !== undefined ? filters.recommend_challenge : true;
      globalCache.filters.status_plan = filters.status_plan !== undefined ? filters.status_plan : true;
      globalCache.filters.status_doing = filters.status_doing !== undefined ? filters.status_doing : true;
      globalCache.filters.status_done = filters.status_done !== undefined ? filters.status_done : true;
      globalCache.filters.difficulty_easy = filters.difficulty_easy !== undefined ? filters.difficulty_easy : true;
      globalCache.filters.difficulty_mid = filters.difficulty_mid !== undefined ? filters.difficulty_mid : true;
      globalCache.filters.difficulty_hard = filters.difficulty_hard !== undefined ? filters.difficulty_hard : true;
      globalCache.filters.order = filters.order !== undefined ? filters.order : ORDER_ASC;
  
      // 调用 loadProblems 方法重新加载题目列表
      this.loadProblems(globalCache.filters);
    }

    private loadProblems(filters: any) {
        // 这里假设有一个方法来加载题目列表，可以根据需要实现
        console.log('Loading problems with filters:', filters);
        // todo: 实现加载题目列表的逻辑
    }

}