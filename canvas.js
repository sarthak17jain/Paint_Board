let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let pencilColor = document.querySelectorAll(".pencil-color");
let pencilWidthElem = document.querySelector(".pencil-width");
let eraserWidthElem = document.querySelector(".eraser-width");
let download = document.querySelector(".download");
let redo = document.querySelector(".redo");
let undo = document.querySelector(".undo");

let penColor = "red";
let eraserColor = "white";
let penWidth = pencilWidthElem.value;
let eraserWidth = eraserWidthElem.value;

//undo-redo algorithm used:
//Undo pops the stack and pushes onto a redo stack, and redo pops from the second stack onto the first. A new change clears the redo stack.

//instead of a stack implementation we use an array :

//we maintain a pointer named track which tells the current state
//when something new is drawn or erased the the current graphic image is inserted into the array in front of the current stack pointer
//track pointer is incremented
//since a new operation clears the redo stack in this array we delete all the images in front of the image just inserted 
//all these operations are done by a splice operation

//undoing and redoing just decrements and increments the track pointer without affecting the image array at all
//the image array is only changed when something new is drawn or erased

let undoRedoTracker = []; // Data
let track = -1; // Represent which action from tracker array

let mouseDown = false;

let flagmousemoved = false;

//eraserFlag can be accessed here even if it is not declared here, since it is declared in tools.js
//and tools.js is linked to the html along with this javascript file
//so this javascript file can access the global variable 

//API
let tool = canvas.getContext("2d");

tool.strokeStyle = penColor;
tool.lineWidth = penWidth;

// mousedown -> start new path, mousemove -> path fill (graphics)
canvas.addEventListener("mousedown",(e) => {
    mouseDown = true;
    beginPath({
        x: e.clientX,
        y: e.clientY
    });

})
canvas.addEventListener("mousemove",(e) => {
    if (mouseDown){ 
        flagmousemoved = true;
        drawStroke({
        x: e.clientX,
        y: e.clientY,
        color : eraserFlag ? eraserColor : penColor,
        width : eraserFlag ? eraserWidth : penWidth
        });
    }
    
})
canvas.addEventListener("mouseup", (e) => {
    mouseDown = false;
    
    // if condition -> so that if something is actually drawn only then push the image to array 
    if (flagmousemoved==true){
        let url = canvas.toDataURL();
        //undoRedoTracker.push(url);
        //track = undoRedoTracker.length-1;
        //undo redo 
        //splice method deletes elements starting from the start index(including it)
        //it inserts elements at the specified position (ie at the first argument) 
        //instead of writing (track+1,(undoRedoTracker.length-1)-(track+1)+1,url)
        //we first increment the tracker and write:
        track++;
        undoRedoTracker.splice(track,undoRedoTracker.length-track,url);
        //console.log(undoRedoTracker, track); //for debugging purposes
        flagmousemoved = false;
    }
})

undo.addEventListener("click", (e) => {
    if (track > 0){
        track--;
        // track action
        let trackObj = {
            trackValue: track,
            undoRedoTracker
        }
        undoRedoCanvas(trackObj);
    }else if(track==0){
        tool.clearRect(0, 0, canvas.width, canvas.height);
        track--;
    }
})

redo.addEventListener("click", (e) => {
    if (track < undoRedoTracker.length-1){ 
        track++;
        // track action
        let trackObj = {
            trackValue: track,
            undoRedoTracker
        }
        undoRedoCanvas(trackObj);
    }    
})

function undoRedoCanvas(trackObj){
    //console.log("undocalled"); //for debugging purposes

    track = trackObj.trackValue;
    undoRedoTracker = trackObj.undoRedoTracker;
    let url = undoRedoTracker[track];
    let img = new Image(); // new image reference element
    img.src = url;

    //console.log(undoRedoTracker,track); //for debugging purposes
    //console.log(img.src); //for debugging purposes
    img.onload = (e) =>{
        // drawImage() draws image on top of what is currently on the canvas
        // therefore we first clear the canvas and then use drawImage() function 
        tool.clearRect(0, 0, canvas.width, canvas.height);
        tool.drawImage(img, 0, 0, canvas.width, canvas.height);
        //console.log("image drawn"); //for debugging purposes
    }
}

function beginPath(strokeObj){
    tool.beginPath();
    tool.moveTo(strokeObj.x,strokeObj.y);
}

function drawStroke(strokeObj){
    tool.strokeStyle = strokeObj.color;
    tool.lineWidth = strokeObj.width;
    tool.lineTo(strokeObj.x,strokeObj.y);
    tool.stroke();
}

pencilColor.forEach((colorElem) => {
    colorElem.addEventListener("click", (e) =>{
        let color = colorElem.classList[0];
        penColor = color;
        tool.strokeStyle = penColor;
    })
})

pencilWidthElem.addEventListener("change",(e) => {
    penWidth = pencilWidthElem.value;
    tool.lineWidth = penWidth;
})

eraserWidthElem.addEventListener("change", (e) => {
    eraserWidth = eraserWidthElem.value;
    tool.lineWidth = eraserWidth;
})

eraser.addEventListener("click", (e) =>{
    if(eraserFlag){
        tool.strokeStyle = eraserColor;
        tool.lineWidth = eraserWidth;
    }else{
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