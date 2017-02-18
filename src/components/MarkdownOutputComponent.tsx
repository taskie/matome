import * as React from "react";
import * as ReactDOM from "react-dom";
const ReactMarkdown = require("react-markdown");

export class MarkdownOutputComponent extends React.Component<{ markdown: string }, {}> {
    render() {
        return (<ReactMarkdown source={this.props.markdown} escapeHtml={true} />)
    }
}