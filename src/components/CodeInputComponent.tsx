import * as React from "react";
import * as ReactDOM from "react-dom";
const ReactCodeMirror = require("react-codemirror");

if (typeof(window) !== "undefined") {
    require('codemirror/mode/markdown/markdown');
}

export class CodeInputComponent extends React.Component<{ code: string, onChange?: (code: string) => void }, { code: string }> {
    render() {
        const options = {
            lineNumbers: true,
            mode: "markdown",
            theme: "solarized dark",
        };
        let code = "";
        if (this.state != null && this.state.code != null) {
            code = this.state.code;
        } else if (this.props != null && this.props.code != null) {
            code = this.props.code;
        }
        return (<ReactCodeMirror value={code} onChange={this.updateCode.bind(this)} options={options} />);
    }

    updateCode(newCode: string) {
        this.setState({
            code: newCode,
        });
        if (this.props.onChange != null) {
            this.props.onChange(newCode);
        }
    }
}