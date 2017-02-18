import * as React from "react";
import * as ReactDOM from "react-dom";
import { MarkdownOutputComponent } from "../components/MarkdownOutputComponent";
import { Message, MarkdownValue, ConnectionIdValue } from "../messages/all";

export class Application {
    private _ws: WebSocket;
    private _connectionId: string;
    private _serverId: string;
    private _input: HTMLTextAreaElement;
    private _output: HTMLDivElement;
    private _markdown: string;
    private _inputTimer: any;

    run() {
        this._initWebSocket();

        const input = document.getElementById("mtm_input") as HTMLTextAreaElement;
        this._input = input;
        this._markdown = input.value;
        input.addEventListener("keydown", this._inputOnKeydown.bind(this), false);

        const output = document.getElementById("mtm_output") as HTMLDivElement;
        this._output = output;
        this._renderOutput();
    }

    private _initWebSocket() {
        const ws_server = (document.getElementById("mtm_ws_server") as HTMLInputElement).value;

        const ws = new WebSocket(ws_server);
        this._ws = ws;

        ws.addEventListener("open", this._wsOnOpen.bind(this));
        ws.addEventListener("error", this._wsOnError.bind(this));
        ws.addEventListener("message", this._wsOnMessage.bind(this));
        ws.addEventListener("close", this._wsOnClose.bind(this));
    }

    private _wsOnOpen(ev: Event) {
        console.log("WebSocket opened");
    }

    private _wsOnError(err: ErrorEvent) {
        console.error('WebSocket error:' + err);
    }

    private _wsOnMessage(mes: MessageEvent) {
        console.log("WebSocket message: " + mes.data);
        const { type, value, from } = JSON.parse(mes.data) as Message;
        switch (type) {
            case "markdown":
                const { markdown } = value as MarkdownValue;
                if (from !== this._connectionId) {
                    this._markdown = markdown;
                    const oldSelectionStart = this._input.selectionStart;
                    this._input.value = markdown;
                    this._input.selectionStart = oldSelectionStart;
                    this._input.selectionEnd = oldSelectionStart;
                }
                this._renderOutput();
                break;
            case "connectionid":
                this._connectionId = (value as ConnectionIdValue).connectionId;
                this._serverId = from;
                break;
        }
    }

    private _wsOnClose(ev: CloseEvent) {
        console.log("WebSocket closed");
    }

    private _inputOnKeydown(ev: KeyboardEvent) {
        if (this._inputTimer == null) {
            this._inputTimer = setTimeout(() => {
                this._inputTimer = null;
                this._sendText();
            }, 200);
        }
        var elem, end, start, value;
        if (ev.keyCode === 9) {
            if (ev.preventDefault) {
                ev.preventDefault();
            }
            elem = ev.target as HTMLTextAreaElement;
            start = elem.selectionStart;
            end = elem.selectionEnd;
            value = elem.value;
            elem.value = "" + (value.substring(0, start)) + "\t" + (value.substring(end));
            elem.selectionStart = elem.selectionEnd = start + 1;
            return false;
        }
    }

    private _sendText() {
        if (this._connectionId == null) { return; }
        this._markdown = this._input.value;
        let value = { markdown: this._markdown } as MarkdownValue;
        this._ws.send(JSON.stringify({ type: "markdown", from: this._connectionId, value } as Message));
        console.log("WebSocket send message");
        return true;
    }

    private _renderOutput() {
        ReactDOM.render(<MarkdownOutputComponent markdown={this._markdown} />, this._output);
    }
}