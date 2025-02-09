function preload() {
  pieces = {
    "b": loadImage("resources/bB.png"),
    "B": loadImage("resources/bW.png"),
    "k": loadImage("resources/kB.png"),
    "K": loadImage("resources/kW.png"),
    "n": loadImage("resources/nB.png"),
    "N": loadImage("resources/nW.png"),
    "p": loadImage("resources/pB.png"),
    "P": loadImage("resources/pW.png"),
    "q": loadImage("resources/qB.png"),
    "Q": loadImage("resources/qW.png"),
    "r": loadImage("resources/rB.png"),
    "R": loadImage("resources/rW.png"),
  }
}


function setup() {
  createCanvas(800, 800);
}

function draw() {
  let grid = [...Array(8)].map(e => Array(8));
  grid[0][0] = "K";
  grid[3][5] = "r";
  let currentBoard = new Board(grid);
  console.log(currentBoard);
  drawBoard(800, currentBoard);
}


function drawBoard(canvasWidth, board) {
  push();
  strokeWeight(0);
  let light = true;
  squareWidth = canvasWidth / 8;
  for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
          light = (r + c) % 2
          fill(light ? 100 : 200);
          square(c * squareWidth, r * squareWidth, squareWidth);
          if (board.pieceArray[r][c]) {
            image(pieces[board.pieceArray[r][c]],
              c * squareWidth, r * squareWidth, squareWidth, squareWidth);
          }
      }
  }
  
  strokeWeight(8);
  stroke(0);
  noFill();
  square(0, 0, canvasWidth);
  pop();
}