import * as vscode from 'vscode';
import * as fs from 'fs';
import { EventManager, FILTEREVENT } from './infrastructure/event/eventManager';
import { globalCache } from './infrastructure/cache/globalCache';
import { DIFFICULTY_EASY, DIFFICULTY_EASY_ZH, DIFFICULTY_HARD, DIFFICULTY_HARD_ZH, DIFFICULTY_MEDIUM, DIFFICULTY_MEDIUM_ZH, ORDER_ASC, ORDER_ASC_ZH, ORDER_DESC_ZH, RECOMMEND_BASIC, RECOMMEND_BASIC_ZH, RECOMMEND_CHALLENGE, RECOMMEND_CHALLENGE_ZH, RECOMMEND_NEED, RECOMMEND_NEED_ZH, STATUS_DOING, STATUS_DOING_ZH, STATUS_DONE, STATUS_DONE_ZH, STATUS_PLAN, STATUS_PLAN_ZH } from './infrastructure/constants/constants';
import path from 'path';
import { logger } from './infrastructure/log/logger';

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
          if (dir!== '' && dir!==globalCache.problemDir) {
            globalCache.problemDir = dir;
            globalCache.isInit = true; // 标记路径是否变更
          }
          break;
      }
    });

  }


  private refresh() {
    // 加载数据
    loadProblems(globalCache.workspacepath + globalCache.problemDir);
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



export function loadProblems(problemsPath: string): any[] {
  const problems: any[] = [];
  const problemListPath = problemsPath;
  logger.info("path:" + problemListPath);
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
  // 提炼所有 problems 中的 tags 形成一个不重复的 tags 列表
  const allTags = getUniqueTags(problems);
  globalCache.tags = allTags;
  if (globalCache.isInit) {
    // 第一次初始化
    globalCache.filtertags = allTags;
    globalCache.isInit = false;
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
      (globalCache.filters.difficulty_hard || problem.meta.difficulty !== DIFFICULTY_HARD) &&
      (problem.tags.some((tag: string) => globalCache.filtertags.includes(tag)));
  });
  logger.info("cache:" + JSON.stringify(globalCache,null,2));
  logger.info("result:" + JSON.stringify(filteredProblems,null,2));
  // 更新 globalCache.tags
  globalCache.problems = filteredProblems;

  return filteredProblems;
}

// 新增函数：提炼所有 problems 中的 tags 形成一个不重复的 tags 列表
function getUniqueTags(problems: any[]): string[] {
  const tagsSet = new Set<string>();
  problems.forEach(problem => {
    problem.tags.forEach((tag: string) => {
      tagsSet.add(tag);
    });
  });
  return Array.from(tagsSet);
}