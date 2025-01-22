import * as vscode from 'vscode';



export class Logger {
    private outputChannel: vscode.OutputChannel;

    constructor(channelName: string) {
        this.outputChannel = vscode.window.createOutputChannel(channelName);
    }

    info(message: string) {
        this.log('INFO', message);
    }

    warn(message: string) {
        this.log('WARN', message);
    }

    error(message: string) {
        this.log('ERROR', message);
    }

    private log(level: string, message: string) {
        const timestamp = new Date().toLocaleTimeString();
        this.outputChannel.appendLine(`[${timestamp}] [${level}] ${message}`);
    }

    show() {
        this.outputChannel.show();
    }
}

// 使用示例
export const logger = new Logger("codeTrack");