const express = require("express")
const path = require("path")
const app = express()
const formatMessage = require("./functions")
var server = require('http').createServer(app);
var io = require('socket.io')(server);
server.listen(3000)

function appInit() {
    app.use(express.static(path.join(__dirname, "Public")))
    app.get("/", async (req, res) => {
        res.sendFile(__dirname + "/Public/chat.html")
    })
}appInit()


dict = {}

io.on("connection", socket => {
    console.log(socket.id)
    socket.on("joinRoom", (room) => {
        console.log(room);
        if(dict[socket.id]) {
            socket.broadcast.to(dict[socket.id]).emit("message", formatMessage("An user left"))
            socket.leave(dict[socket.id])
        }
        dict[socket.id] = room
        socket.join(dict[socket.id])
        socket.emit("message", formatMessage("Welcome to room "+room))
        socket.broadcast.to(dict[socket.id]).emit("message", formatMessage("An user joined"))
    })
    socket.on("message", (message) => {
        console.log("mes room "+dict[socket.id]);
        socket.broadcast.to(dict[socket.id]).emit("message", formatMessage(message))
    })
    socket.on("disconnect", () => {
        if(dict[socket.id]) {
            socket.broadcast.to(dict[socket.id]).emit("message", formatMessage("An user left"))
            socket.leave(dict[socket.id])
        }
    })
})
