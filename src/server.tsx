import * as path from "path";
import * as http from "http";
import * as fs from "fs";

import * as React from "react";
import { renderToString } from "react-dom/server";
import { MarkdownOutput } from "./lib/MarkdownOutput";

import * as Koa from "koa";
import * as KoaRouter from "koa-router";
import * as koaStatic from "koa-static";
import * as websocket from "websocket";
const WebSocketServer = websocket.server;

import * as ejs from "ejs";

const server_name = process.argv[2];
const port_koa = parseInt(process.argv[3]);
const port_ws = parseInt(process.argv[4]);
const ws_server = `ws://${server_name}:${port_ws}/`;

if (isNaN(port_koa) || isNaN(port_ws)) {
    console.error("please specify port numbers");
    process.exit(1);
}

let markdown = fs.readFileSync("data.txt", "utf8");

const templates = {
    index: require("./views/index.ejs"),
};

const app = new Koa();
const router = new KoaRouter();

router.get("/", async (ctx: KoaRouter.IRouterContext, next: () => Promise<any>) => {
    let data = {
        title: "matome",
        input: markdown,
        output: renderToString(<MarkdownOutput markdown={markdown} />),
        ws_server
    }
    ctx.body = templates.index(data);
    await next();
});

router.get("*", koaStatic("./static/"));
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port_koa, async function () {
    console.log(`Example app listening on port ${port_koa}!`);
});

var wsserver = http.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

wsserver.listen(port_ws, function () {
    console.log((new Date()) + ` Server is listening on port ${port_ws}`);
});

let ws = new WebSocketServer({ httpServer: wsserver, autoAcceptConnections: false });

function originIsAllowed(origin: string) {
    console.log(origin);
    return true;
}

let connectionNumber = 0;
let connections = {} as {[_: string]: websocket.connection};

ws.on('request', function (request) {
    if (!originIsAllowed(request.origin)) {
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var connection = request.accept();
    console.log((new Date()) + ' Connection accepted.');
    const connectionId = `${connectionNumber}:${(new Date()).getTime()}`;
    connectionNumber++;
    connections[connectionId] = connection;
    connection.sendUTF(JSON.stringify({type: "connection_id", value: connectionId}));

    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            let { type, value } = JSON.parse(message.utf8Data);
            switch (type) {
                case "markdown":
                    const { markdown: markdown_new, from } = value;
                    markdown = markdown_new;
                    ws.broadcastUTF(message.utf8Data);
                    break;
            }
        } else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function (reasonCode, description) {
        delete connections[connectionId];
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

setInterval(() => {
    fs.writeFile("./data.txt", markdown);
    console.log("wrote.");
}, 10000);