import * as React from "react";
import * as ReactDOM from "react-dom";
const reactMarked = require("react-marked");
reactMarked.setOptions({
    renderer: new reactMarked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false,
    highlight: (code: any) => {
        return require('highlightjs').highlightAuto(code).value;
    }
});

export class MarkdownOutput extends React.Component<{ markdown: string }, {}> {
    render() {
        return (<div>{reactMarked(this.props.markdown)}</div>);
    }
}