import { Application } from "./client/app";

document.addEventListener("DOMContentLoaded", (ev) => {
    const client = new Application();
    client.run();
});