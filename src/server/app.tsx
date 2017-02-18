// import { typed as promisify } from "../commons/ts-promisify";

import * as path from "path";
import * as http from "http";
// const http2 = require("http2");
const http2 = require("https");
import * as fs from "fs";

import * as React from "react";
import { renderToString } from "react-dom/server";
import { MarkdownOutputComponent } from "../components/MarkdownOutputComponent";

import * as Koa from "koa";
import * as KoaRouter from "koa-router";
import * as koaStatic from "koa-static";
import * as websocket from "websocket";
import * as uuid from "uuid";

import { EventEmitter } from "events";

type WebSocketServer = websocket.server;
const WebSocketServer = websocket.server;

import { ApplicationConf } from "./types";
import { Message, MarkdownValue, ConnectionIdValue } from "../messages/all";

export class Server extends EventEmitter {
    public httpServer: http.Server;
    public wsServer: WebSocketServer;
    public httpURL: string;
    public wsURL: string;
    private _serverUUID: string;
    private _connections: { [_: string]: websocket.connection };

    constructor(private _conf: ApplicationConf, public httpHandler: (req: http.IncomingMessage, res: http.ServerResponse) => void) {
        super();
        this._connections = {};
    }

    private _init() {
        this._initHTTPServer();
        this._initWSServer();
    }

    private _initHTTPServer() {
        if (this._conf.server.ssl != null) {
            this.httpURL = `https://${this._conf.server.target.host}:${this._conf.server.target.port}/`;
            this.wsURL = `wss://${this._conf.server.target.host}:${this._conf.server.target.port}/`;
            const ssl = {
                key: fs.readFileSync(this._conf.server.ssl.key),
                cert: fs.readFileSync(this._conf.server.ssl.cert),
             };
            this.httpServer = http2.createServer(ssl, this.httpHandler) as any;
        } else {
            this.httpURL = `http://${this._conf.server.target.host}:${this._conf.server.target.port}/`;
            this.wsURL = `ws://${this._conf.server.target.host}:${this._conf.server.target.port}/`;
            this.httpServer = http.createServer(this.httpHandler);
        }
    }

    private _initWSServer() {
        const ws = new WebSocketServer({ httpServer: this.httpServer, autoAcceptConnections: false });
        this.wsServer = ws;
        this._serverUUID = uuid.v4();

        ws.on('request', (request) => {
            if (!this._originIsAllowed(request.origin)) {
                request.reject();
                console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
                return;
            }

            var connection = request.accept();
            console.log((new Date()) + ' Connection accepted.');
            const connectionId = uuid.v4();
            this._connections[connectionId] = connection;
            connection.sendUTF(JSON.stringify({ type: "connectionid", value: { connectionId } as ConnectionIdValue, from: this._serverUUID }));

            connection.on('message', (message) => {
                this.emit("message", message);
            });
            connection.on('close', (reasonCode, description) => {
                delete this._connections[connectionId];
                console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
            });
        });
    }

    public listen() {
        if (this.httpServer) {
            console.error("already listened.");
            return;
        }
        this._init();
        this.httpServer.listen(this._conf.server.target.port);
    }

    private _originIsAllowed(origin: string) {
        console.log(origin);
        return true;
    }
}

export class Application {
    public koa: Koa;
    public server: Server;
    public markdown: string;

    constructor(private _conf: ApplicationConf) { }

    run() {
        this._init();
        this.server.on("message", this._onMessage.bind(this));
        this.server.listen();
    }

    private _init() {
        this._initKoa();
        this.markdown = fs.readFileSync("data.txt", "utf8");
        setInterval(() => {
            fs.writeFile("./data.txt", this.markdown);
            console.log("wrote.");
        }, 10000);
        this.server = new Server(this._conf, this.koa.callback());
    }

    private _initKoa() {
        const templates = {
            index: require("../views/index.ejs"),
        };

        const app = new Koa();
        this.koa = app;

        const router = new KoaRouter();

        router.get("/", async (ctx: KoaRouter.IRouterContext, next: () => Promise<any>) => {
            let data = {
                title: "matome",
                input: this.markdown,
                output: renderToString(<MarkdownOutputComponent markdown={this.markdown} />),
                ws_server: this.server.wsURL
            }
            ctx.body = templates.index(data);
            await next();
        });

        router.get("*", koaStatic("static/"));
        app.use(router.routes());
        app.use(router.allowedMethods());
    }

    private _onMessage(message: websocket.IMessage) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            let { type, value, from } = JSON.parse(message.utf8Data) as Message;
            switch (type) {
                case "markdown":
                    const { markdown: markdown_new } = value as MarkdownValue;
                    this.markdown = markdown_new;
                    this.server.wsServer.broadcastUTF(message.utf8Data);
                    break;
            }
        } else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        }
    }
}
