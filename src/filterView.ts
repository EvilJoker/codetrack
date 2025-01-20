import * as vscode from 'vscode';

export class FilterViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'filterView';
  private _view?: vscode.WebviewView;

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

    // 监听来自 Webview 的消息
    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case 'search':
          // todo 待实现
          vscode.commands.executeCommand('customTreeView.filterData', message.text);
          break;
      }
    });
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
            <!--<input type="text" id="search" placeholder="Enter search term" /> -->
            <!-- <button onclick="search()">Search</button> -->
            <label>推荐：</label>
            <label><input type="checkbox" id="recommend" checked> 基础</label>
            <label><input type="checkbox" id="recommend" checked> 熟练</label>
            <label><input type="checkbox" id="recommend" checked> 挑战</label>
            <br>
            <label>状态：</label>
            <label><input type="checkbox" id="status" checked> 计划</label>
            <label><input type="checkbox" id="status" checked> 进行</label>
            <label><input type="checkbox" id="status" checked> 完成</label>
            <br>
            <label>难度：</label>
            <label><input type="checkbox" id="difficulty" checked> 简单</label>
            <label><input type="checkbox" id="difficulty" checked> 中等</label>
            <label><input type="checkbox" id="difficulty" checked> 困难</label>
            <br>
            <label>排序：</label>
            <label><input type="radio" name="order" value="ascending" checked > 升序</label>
            <label><input type="radio" name="order" value="descending" > 降序</label>
            <script>
            const vscode = acquireVsCodeApi();
            function search() {
                const value = document.getElementById('search').value;
                const filters = {
                    recommend: document.getElementById('recommend').checked,
                    status: document.getElementById('status').checked,
                    difficulty: document.getElementById('difficulty').checked,
                    updateTime: document.getElementById('updateTime').checked,
                    ascending: document.getElementById('ascending').checked
                };
                vscode.postMessage({ command: 'search', text: value, filters: filters });
            }
            </script>
        </div>
      </body>
      </html>
    `;
  }
}