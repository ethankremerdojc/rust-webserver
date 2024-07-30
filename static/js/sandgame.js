console.log("Sandgame!");

let canvas = document.getElementById("sandCanvas");

let canvasWidth = 400;
let canvasHeight = 400;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

canvasContext = canvas.getContext("2d");

function default2DArray(rowsCount, colsCount, value=0) {
    let result = [];

    for (let r = 0; r < rowsCount; r++) {
        let row = [];

        for (let i = 0; i < colsCount; i++) {
            row.push(value);
        }

        result.push(row);
    }

    return result
}

let rows = 40;
let cols = 40;
let grid = default2DArray(40, 40);
let cellSize = 10;

let mouseDownInCanvas = false;

let selectedCell;

function handleMouseUp(event) {
    mouseDownInCanvas = false;
}

function handleMouseDown(event) {
    mouseDownInCanvas = true;
}

function handleMouseMove(event) {
    selectedCell = getMousePos(canvas, event);
}

function draw() {
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
        for (let colIndex = 0; colIndex < cols; colIndex++) {

            let cell = grid[colIndex][rowIndex];

            if (cell == 1) {
                canvasContext.fillRect(cellSize*rowIndex, cellSize*colIndex, cellSize, cellSize);
            }
        }
    }
}

function moveSand() {

    let newGrid = default2DArray(40, 40);

    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
        for (let colIndex = 0; colIndex < cols; colIndex++) {

            let cell = grid[rowIndex][colIndex];

            let randNum = Math.random() > 0.5 ? -1 : 1;

            if (cell == 1) {
                // check if below sand is an empty space and isn't the bottom
                if (rowIndex == rows - 1) {
                    newGrid[rowIndex][colIndex] = 1;
                } else if (grid[rowIndex + 1][colIndex] == 0) {
                    newGrid[rowIndex + 1][colIndex] = 1;

                } else if (grid[rowIndex + 1][colIndex - randNum] == 0) {
                    newGrid[rowIndex + 1][colIndex - randNum] = 1;
                } else if (grid[rowIndex + 1][colIndex + randNum] == 0) {
                    newGrid[rowIndex + 1][colIndex + randNum] = 1;

                } else {
                    newGrid[rowIndex][colIndex] = 1;
                }
            }
        }
    }

    grid = newGrid;
}

function tick() {
    moveSand();
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    draw();

    if (mouseDownInCanvas) {
        console.log("Mouse down")
        summonSand(selectedCell)
    }

    setTimeout(tick, 30);
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function summonSand(mousePos) {
    let row = Math.floor(mousePos.y / cellSize);
    let col = Math.floor(mousePos.x / cellSize); 

    grid[row][col] = 1;
}

tick();