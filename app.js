const express = require("express");
const socket = require("socket.io");

const app = express();

let port = 5000;

app.use(express.static("public"));

let server = app.listen(port, () => {
    console.log("listening to port " + port);
})

let io = socket(server);

io.on("connection", (socket) => {
    console.log("socket connection done");

    // recieved data from frontend on the server 
    socket.on("beginPath", (data) => {
        // now transfer data to all the computers 
        io.sockets.emit("beginPath", data);
    })

    socket.on("drawStroke", (data) => {
        io.sockets.emit("drawStroke", data);
    })

    socket.on("redoUndo" , (data) => {
        io.sockets.emit("redoUndo" , data);
    })
});