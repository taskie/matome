export interface Message {
    type: string,
    value: any,
    from: string,
}

export interface MarkdownValue {
    markdown: string,
}

export interface ConnectionIdValue {
    connectionId: string,
}