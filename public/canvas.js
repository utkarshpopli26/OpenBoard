let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let pencilColor = document.querySelectorAll(".pencil-color");
let pencilWidthElem = document.querySelector(".pencil-width");
let eraserWidthElem = document.querySelector(".eraser-width");
let redo = document.querySelector(".redo");
let undo = document.querySelector(".undo");

let download = document.querySelector(".download");

let penColor = "red";
let eraserColor = "white";
let penWidth = pencilWidthElem.value;
let eraserWidth = eraserWidthElem.value;

let undoRedoTracker = [];
let track = 0;

let mousedown = false;

// API 
let tool = canvas.getContext("2d");

tool.strokeStyle = penColor;
tool.lineWidth = penWidth;

// begin a new path 
canvas.addEventListener("mousedown", (e) => {
    mousedown = true;
    // beginPath({
    //     x: e.clientX,
    //     y: e.clientY
    // });

    let data = {
        x: e.clientX,
        y: e.clientY
    }

    socket.emit("beginPath", data);
})

// fill with graphics 
canvas.addEventListener("mousemove", (e) => {
    if (mousedown) {
        let data = {
            x: e.clientX,
            y: e.clientY
        }
        socket.emit("drawStroke", data);
    }
})

canvas.addEventListener("mouseup", (e) => {
    mousedown = false;
    let url = canvas.toDataURL();
    undoRedoTracker.push(url);
    track = undoRedoTracker.length - 1;
})


function beginPath(strokeObj) {
    tool.beginPath(); // begin path 
    tool.moveTo(strokeObj.x, strokeObj.y); // x and y coordinate
}

function drawStroke(strokeObj) {
    tool.lineTo(strokeObj.x, strokeObj.y);
    tool.stroke();
}

pencilColor.forEach((colorElem) => {
    colorElem.addEventListener("click", (e) => {
        let color = colorElem.classList[0];
        pencilColor = color;
        tool.strokeStyle = color;
        penWidth = pencilWidthElem.value;
        tool.lineWidth = penWidth;
    })
})

pencilWidthElem.addEventListener("change", (e) => {
    penWidth = pencilWidthElem.value;
    tool.lineWidth = penWidth;
})

eraserWidthElem.addEventListener("change", (e) => {
    eraserWidth = eraserWidthElem.value;
    tool.lineWidth = eraserWidth;
})

eraser.addEventListener("click", (e) => {
    if (eraserFlag) {
        tool.strokeStyle = eraserColor;
        tool.lineWidth = eraserWidth;
    }
    else {
        tool.strokeStyle = penColor;
        tool.lineWidth = penWidth;
    }
})

download.addEventListener("click", (e) => {
    let url = canvas.toDataURL();
    let a = document.createElement("a");
    a.href = url;
    a.download = "board.jpg";
    a.click();
})

function undoRedoCanvas(trackObj) {
    track = trackObj.trackValue;
    undoRedoTracker = trackObj.undoRedoTracker;

    let url = undoRedoTracker[track];
    let img = new Image();
    img.src = url;

    // another way of adding eventlistener
    img.onload = (e) => {
        tool.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
}

undo.addEventListener("click", (e) => {
    if (track > 0) track--;
    let data = {
        trackValue: track,
        undoRedoTracker
    }
    socket.emit("redoUndo", data);
})

redo.addEventListener("click", (e) => {
    if (track < undoRedoTracker.length - 1) track++;
    let data = {
        trackValue: track,
        undoRedoTracker
    }
    socket.emit("redoUndo", data);
})

// got data from server 
socket.on("beginPath", (data) => {
    beginPath(data);
})

socket.on("drawStroke", (data) => {
    drawStroke(data);
})

socket.on("redoUndo", (data) => {
    undoRedoCanvas(data);
})