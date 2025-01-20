import * as vscode from 'vscode';
export const FILTEREVENT='refreshData';

export class EventManager {
  private static _onGlobalEvent = new vscode.EventEmitter<{ type: string, payload: any }>();
  public static readonly onGlobalEvent = EventManager._onGlobalEvent.event;

  public static fireEvent(type: string, payload: any) {
    this._onGlobalEvent.fire({ type, payload });
  }
}
