export interface ApplicationConf {
    server: ServerConf,
}

export interface ServerConf {
    target: {
        host: string,
        port: number,
    },
    ssl?: {
        key: string,
        cert: string,
    },
}