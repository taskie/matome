https = require "https"
fs = require "fs"
socketio = require "socket.io"

options =
    key: fs.readFileSync "/etc/letsencrypt/live/memo.skie.jp/privkey.pem"
    cert: fs.readFileSync "/etc/letsencrypt/live/memo.skie.jp/cert.pem"
    requestCert: true
    rejectUnauthorized: false

latestData = value: fs.readFileSync("./memo.txt", "utf8")

server = https.createServer options, (req, res) ->
    if req.url == "/"
        res.writeHead 200, {"Content-Type": "text/html"}
        html = fs.readFileSync "./index.html"
        res.end html
    else if req.url.match(/\.js$/)
        res.writeHead 200, {"Content-Type": "text/javascript"}
        file = fs.readFileSync ".#{req.url}"
        res.end file

server.listen 8765
io = socketio.listen server

io.sockets.on "connection", (socket) ->
    socket.emit "chat", latestData
    socket.on "chat", (data) ->
        socket.broadcast.emit "chat", data
        latestData = data
        fs.writeFileSync "memo.txt", data.value
