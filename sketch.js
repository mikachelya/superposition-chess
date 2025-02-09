let legalMovesArr = [];
let squareWidth;


function preload() {
  PIECES = [
    [
      loadImage("resources/bW.png"),
      loadImage("resources/kW.png"),
      loadImage("resources/nW.png"),
      loadImage("resources/pW.png"),
      loadImage("resources/qW.png"),
      loadImage("resources/rW.png"),
    ],
    [
      loadImage("resources/bB.png"),
      loadImage("resources/kB.png"),
      loadImage("resources/nB.png"),
      loadImage("resources/pB.png"),
      loadImage("resources/qB.png"),
      loadImage("resources/rB.png"),
    ]
  ]
}


function setup() {
  
  canvasWidth = min(windowHeight, windowWidth) - 20;
  createCanvas(canvasWidth, canvasWidth);

  let grid = [...Array(8)].map(_ => Array(8));
  grid[0][0] = new Piece([KING], WHITE);
  grid[3][5] = new Piece([ROOK], BLACK);
  grid[1][5] = new Piece([BISHOP], BLACK);
  grid[3][3] = new Piece([BISHOP], WHITE);
  grid[5][4] = new Piece([KNIGHT], BLACK);
  grid[6][3] = new Piece([PAWN], WHITE);
  grid[1][3] = new Piece([PAWN], BLACK);
  grid[2][2] = new Piece([PAWN], WHITE);
  grid[5][2] = new Piece([KING], BLACK);
  mainBoard = new Board(grid);
  squareWidth = canvasWidth / 8;

  console.log("White is in check: ", isCheck(mainBoard, WHITE));
  console.log("Black is in check: ", isCheck(mainBoard, BLACK));
}


function draw() {
  drawBoard(mainBoard);
  drawLegalMoves();
}


function drawBoard(board) {
  push();
  strokeWeight(0);
  let light = true;
  for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
          light = (r + c) % 2
          fill(light ? 100 : 200);
          square(c * squareWidth, r * squareWidth, squareWidth);
          if (board.pieceArray[r][c]) {
            drawPiece(r, c, board.pieceArray[r][c]);
          }
      }
  }

  strokeWeight(squareWidth / 15);
  stroke(0);
  noFill();
  square(0, 0, canvasWidth);
  pop();
}


function windowResized() {
  canvasWidth = min(windowHeight, windowWidth) - 20;
  squareWidth = canvasWidth / 8;
  resizeCanvas(canvasWidth, canvasWidth);
}


function drawPiece(r, c, piece) {
  if (piece.typeArray.length == 1)
    image(PIECES[piece.colour][piece.typeArray[0]],
      c * squareWidth, r * squareWidth, squareWidth, squareWidth);
}


function mousePressed() {
  squareWidth = canvasWidth / 8;

  r = (mouseY / squareWidth) >> 0;
  c = (mouseX / squareWidth) >> 0;

  legalMovesArr = getLegalMovesSimple(mainBoard, r, c);
}


function drawLegalMoves() {
  push();

  noStroke();
  fill(27, 133, 55, 150);
  legalMovesArr.forEach(move => {
    circle(
      move[1] * squareWidth + squareWidth / 2,
      move[0] * squareWidth + squareWidth / 2,
      squareWidth / 4
    );
  });

  pop();
}