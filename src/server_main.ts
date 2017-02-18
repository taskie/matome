import * as commander from "commander";
import * as fs from "fs";
import { typed as promisify } from "./commons/ts-promisify";
import { Application } from "./server/app";

const command = new commander.Command();
command.parse(process.argv);

const configPath = command.args[0];
if (configPath == null) {
    console.log("please specify config file path.");
    process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const server = new Application(config as any);
server.run();