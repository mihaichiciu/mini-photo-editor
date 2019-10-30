let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
let saveBtn = document.getElementById("save-button");
let currentTool = "";
let btnLine = document.getElementById("btn-line");
let btnRect = document.getElementById("btn-rectangle");
let btnCircle = document.getElementById("btn-circle");
let btnStar = document.getElementById("btn-star");
let startPosition;
let radius;
let screen;
let btnCrop = document.getElementById("btn-crop");
let colorPicker = document.getElementById("btn-color-picker");
let isDrawing = false;
let sound = new Audio();
context.strokeStyle = "black";
context.lineWidth = 3;
context.lineCap = context.lineCap = "round"
context.imageSmoothingEnabled = true;
context.font = "normal 23px Arial";
context.fillText("Drag & drop you image here", 
    (canvas.width / 2) - 150, (canvas.height / 2) + 6);
    
canvas.addEventListener("drop", event=> {
    // context.clearRect(0, 0, canvas.width, canvas.height);
    let scale = 2;
    let file = event.dataTransfer.files[0];
    let fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.addEventListener("load", ()=>{
        let image = new Image();
        image.src = fileReader.result;
        image.onload = function(){
            canvas.width = 800;
            canvas.height = 500;
            const imgNatWidth = image.naturalWidth;
            const imgNatHeight = image.naturalHeight;
            let newImgWidth = imgNatWidth;
            let newImgHeight = imgNatHeight;
            let originalRatio = imgNatWidth / imgNatHeight;
            if(newImgWidth > newImgHeight && newImgWidth > 800){
                newImgWidth = 800;
                newImgHeight = 800 / originalRatio;
            }
            if(newImgWidth > newImgHeight && newImgHeight > 500){
                newImgHeight = 500;
                newImgWidth = 500 * originalRatio;
            }
            if(newImgHeight > newImgWidth && newImgHeight > 500){
                newImgHeight = 500;
                newImgWidth = 500 * (originalRatio);
            }
            if(newImgWidth == newImgHeight && newImgHeight > 500){
                newImgHeight = 500;
                newImgWidth = 500;
            }
            context.drawImage(image, 0, 0, newImgWidth, newImgHeight);
        }
    }, false);
    currentTool = "";
    event.preventDefault();
}, false);

btnLine.addEventListener("click", () => {
    currentTool = "line";
    sound.src = "./media/sounds/strike.mp3";
    sound.play();
});

btnRect.addEventListener("click", () => {
    currentTool = "rectangle";
    sound.src = "./media/sounds/timer.mp3";
    sound.play();
});

btnCircle.addEventListener("click", () => {
    currentTool = "circle";
    sound.src = "./media/sounds/veil.mp3";
    sound.play();
});

btnStar.addEventListener("click", () => {
    currentTool = "star";
    sound.src = "./media/sounds/dotted-spiral.mp3";
    sound.play();
});

canvas.addEventListener("dragover", event => {
    event.preventDefault();
}, false);

canvas.addEventListener("mousedown", event => {
    isDrawing = true;
    startPosition = getCanvasPositions(event);
    snapshotScreen();
}, false);

canvas.addEventListener("mousemove", event => {
    var pos;
    if(isDrawing){
        restoreScreen();
        pos = getCanvasPositions(event);
        draw(pos);
    }
}, false);

canvas.addEventListener("mouseup", event => {
    isDrawing = false;
    restoreScreen();
    var pos = getCanvasPositions(event);
    draw(pos)
}, false);

saveBtn.addEventListener("click", event => {
    saveBtn.href = canvas.toDataURL("image/png");
    saveBtn.download ="mycanvas.png";
}, false);

function getCanvasPositions(event) {
    var rect = canvas.getBoundingClientRect();
    var pointX = (canvas.width / rect.width) * (event.clientX - rect.left);
    var pointY = (canvas.height / rect.height) * (event.clientY - rect.top);
    return {
        pointX: pointX,
        pointY: pointY
    }
}

function snapshotScreen(){
    screen = context.getImageData(0, 0, canvas.width, canvas.height);
}

function restoreScreen(){
    context.putImageData(screen, 0, 0); 
}

function draw(endPosition){
    switch(currentTool){
        case "line":
            context.beginPath();
            context.moveTo(startPosition.pointX + 0.5, startPosition.pointY);
            context.lineTo(endPosition.pointX + 0.5, endPosition.pointY);
            context.stroke();
            break;
        case "rectangle":
            context.beginPath();
            context.strokeRect(startPosition.pointX, startPosition.pointY,
                endPosition.pointX - startPosition.pointX, 
                endPosition.pointY - startPosition.pointY);
            break;
        case "circle":
            radius = endPosition.pointX - startPosition.pointX;
            context.beginPath();
            if(radius < 0){
                context.arc(startPosition.pointX, startPosition.pointY, -radius, 0, Math.PI * 2);
            } else {
                context.arc(startPosition.pointX, startPosition.pointY , radius, 0, Math.PI * 2);
            }
            context.stroke();
            break;
        case "star":
            const noPoints = 5;
            let outerCircleRadius = endPosition.pointX - startPosition.pointX;
            let innerCircleRadius = outerCircleRadius * 0.4;
            context.beginPath();
            for(let i = 0; i <= 2 * noPoints; i++){
                var angle = i * Math.PI / noPoints - Math.PI / 2;
                if(i % 2 == 0){
                    radius = outerCircleRadius;
                } else {
                    radius = innerCircleRadius;
                }
                radius = radius < 0 ? -radius : radius;
                context.lineTo(startPosition.pointX + radius * Math.cos(angle),
                    startPosition.pointY + radius * Math.sin(angle));
                context.stroke();
            }
            break;
    }
}

colorPicker.addEventListener("change", () => {
    context.strokeStyle = colorPicker.value;
    sound.src = "./media/sounds/zig-zag.mp3";
    sound.play();
});