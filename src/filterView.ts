import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { EventManager, FILTEREVENT } from './infrastructure/event/eventManager';
import { globalCache } from './infrastructure/cache/globalCache';
import { logger } from './infrastructure/log/logger';
import { LoadProblems } from './infrastructure/model/problem';
import { RECOMMEND_BASIC_ZH, RECOMMEND_NEED_ZH, RECOMMEND_CHALLENGE_ZH, STATUS_PLAN_ZH, STATUS_DOING_ZH, STATUS_DONE_ZH, DIFFICULTY_EASY_ZH, DIFFICULTY_MEDIUM_ZH, DIFFICULTY_HARD_ZH, ORDER_ASC_ZH, ORDER_DESC_ZH, ORDER_ASC } from './infrastructure/constants/constants';

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
      webviewView.webview.html = this.getHtmlForWebview();
      // 创建匿名异步函数来处理 getHtmlForWebview
      (async () => {
        try {
          const htmlContent = await this.getHtmlForWebview();
          webviewView.webview.html = htmlContent;
        } catch (error) {
          logger.error("Failed to get HTML for webview:" + error);
          vscode.window.showErrorMessage("Failed to load webview content.");
        }
      })();
    });

    // 监听 Webview 可见性变化
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        // console.log('Webview is visible');

        // 恢复状态或执行其他操作
      } else {
        // console.log('Webview is hidden');
        // 更新 html 页面

      }
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
          if (dir !== '' && dir !== globalCache.problemDir) {
            globalCache.problemDir = dir;
            globalCache.isInit = true; // 标记路径是否变更
            globalCache.tags = [];
            globalCache.filtertags = [];
          }
          break;
        case 'additem':
          let itempath = message.path.trim();
          if (itempath !== '') {
            this.createProblem(itempath);
          }
          break;
      }
    });

  }

  private createProblem(itempath: string) {
    // 检查目录是否合法
    if (!fs.existsSync(itempath) || !fs.lstatSync(itempath).isDirectory()) {
      vscode.window.showErrorMessage('指定的路径不是一个合法的目录');
      return;
    }

    // 检查目录下是否存在 meta.json 文件
    const metaJsonPath = path.join(itempath, 'meta.json');
    if (fs.existsSync(metaJsonPath)) {
      vscode.window.showErrorMessage('目录下已经存在 meta.json 文件');
      return;
    }

    // 创建 meta.json 文件
    const metaJsonContent = {
      "id": "1",
      "name": "Two Sum",
      "name_zh": "Two Sum",
      "description": "Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
      "description_zh": "Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
      "meta": {
        "difficulty": "easy",
        "recommend": "basic"
      },
      "info": {
        "updateTime": "2023-10-01T12:00:00Z",
        "status": "plan"
      },
      "tags": ["array", "hash-table"]
    };

    fs.writeFileSync(metaJsonPath, JSON.stringify(metaJsonContent, null, 2));
    vscode.window.showInformationMessage('meta.json 文件已成功创建');
  }

  private refresh() {
    // 加载数据
    LoadProblems(globalCache.workspacepath + globalCache.problemDir);
    // 发送消息给其他视图，让它们自行刷新
    EventManager.fireEvent(FILTEREVENT, globalCache.filters);

  }

  private getHtmlForWebview(): string {
    const filters = globalCache.filters || {};
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
                <label id="scanPathshow">问题路径：${globalCache.workspacepath}${globalCache.problemDir}</label>
                <hr>
            <label>推荐：</label>
                <label><input type="checkbox" id="recommend_basic" ${filters.recommend_basic ? 'checked' : ''}> ${RECOMMEND_BASIC_ZH}</label>
                <label><input type="checkbox" id="recommend_need" ${filters.recommend_need ? 'checked' : ''}> ${RECOMMEND_NEED_ZH}</label>
                <label><input type="checkbox" id="recommend_challenge" ${filters.recommend_challenge ? 'checked' : ''}> ${RECOMMEND_CHALLENGE_ZH}</label>
                <br>
                <label>状态：</label>
                <label><input type="checkbox" id="status_plan" ${filters.status_plan ? 'checked' : ''}> ${STATUS_PLAN_ZH}</label>
                <label><input type="checkbox" id="status_doing" ${filters.status_doing ? 'checked' : ''}> ${STATUS_DOING_ZH}</label>
                <label><input type="checkbox" id="status_done" ${filters.status_done ? 'checked' : ''}> ${STATUS_DONE_ZH}</label>
                <br>
                <label>难度：</label>
                <label><input type="checkbox" id="difficulty_easy" ${filters.difficulty_easy ? 'checked' : ''}> ${DIFFICULTY_EASY_ZH}</label>
                <label><input type="checkbox" id="difficulty_mid" ${filters.difficulty_mid ? 'checked' : ''}> ${DIFFICULTY_MEDIUM_ZH}</label>
                <label><input type="checkbox" id="difficulty_hard" ${filters.difficulty_hard ? 'checked' : ''}> ${DIFFICULTY_HARD_ZH}</label>
                <br>
                <label>排序：</label>
                <label><input type="radio" name="order" value="ascending" ${filters.order === 'ascending' ? 'checked' : ''}> ${ORDER_ASC_ZH}</label>
                <label><input type="radio" name="order" value="descending" ${filters.order === 'descending' ? 'checked' : ''}> ${ORDER_DESC_ZH}</label>
                <hr>
                <label>标签：</label>
                 ${globalCache.tags.map(tag => `<label><input type="checkbox" id="tag_${tag}" ${globalCache.filtertags.includes(tag) ? 'checked' : ''}> ${tag}</label>`).join('')}
                <hr>
                <button id="addItem">新增</button>
                <input type="input" id="itemPath" placeholder="输入路径, 生成题目元数据文件" style="width: 300px;" />
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
                    const newDir = document.getElementById('scanPath').value.trim();
                    if (newDir === ''){
                      return
                    }
                    vscode.postMessage({ command: 'updatePath', path: newDir });
                    document.getElementById('scanPathshow').textContent = "问题路径：${globalCache.workspacepath}" + newDir; // 更新 scanPathshow label 的文本内容
                });

                   // 添加新增题目事件监听器
                document.getElementById('addItem').addEventListener('click', () => {
                    const newDir = document.getElementById('itemPath').value.trim();
                    if (newDir === ''){
                      return
                    }
                    vscode.postMessage({ command: 'additem', path: newDir });
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
    console.log("refreshconfig");
    // 更新 tag
    globalCache.filtertags = [];
    for (const key in filters) {
      if (key.startsWith('tag_') && filters[key] === true) {
        let tag_value = key.substring(4);
        globalCache.filtertags.push(tag_value); // 去掉 'tag_' 前缀
      }
    }
    console.log(globalCache.filtertags);

  }

}