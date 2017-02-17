import * as React from "react";
import * as ReactDOM from "react-dom";
const reactMarked = require("react-marked");

export class MarkdownOutput extends React.Component<{markdown: string}, {}> {
    render() {
        return (<div>{reactMarked(this.props.markdown)}</div>);
    }
}