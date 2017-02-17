QS = document.querySelector.bind(document)
QSs = document.querySelectorAll.bind(document)
ID = document.getElementById.bind(document)

socket = io.connect(document.href)

window.addEventListener "DOMContentLoaded", () ->
    memo = ID("memo")
    markdown = ID("markdown")
    socket.on "chat", (data) ->
        memo.value = data.value
        markdown.innerHTML = marked(data.value)
    memo.addEventListener "keyup", () ->
        socket.emit "chat", {value: memo.value}
        markdown.innerHTML = marked(memo.value)
