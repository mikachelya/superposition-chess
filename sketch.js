let legalMovesArr = [];
let squareWidth;
let heldPiece;
let GREEN = [12, 110, 51];
let GREENFILL = [...GREEN, 50];
let GREENSTROKE = [...GREEN, 150];

document.oncontextmenu = _ => false;
document.addEventListener("touchstart", e => e.preventDefault(), {passive: false});

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

    let config = STARTINGFEN.split(" ")[0].split("/");
    let startingRows = [0, 1, 6, 7];
    for (let row in config) {
        for (let letter in config[row]) {
            grid[startingRows[row]][letter] =
                new Piece([LETTERTOPIECE[config[row][letter].toLowerCase()]],
                    config[row][letter] == config[row][letter].toUpperCase() ? WHITE : BLACK);
        }
    }

    // grid[0][5] = new Piece([KING], BLACK);
    // grid[7][7] = new Piece([KING], WHITE);
    // grid[7][6] = new Piece([ROOK], WHITE);
    // grid[2][1] = new Piece([PAWN], WHITE);
    mainBoard = new Board(grid);
    squareWidth = canvasWidth / 8;

    // console.log("White is in check: ", isCheck(mainBoard, WHITE));
    // console.log("Black is in check: ", isCheck(mainBoard, BLACK));
}


function draw() {
    updatePointers();
    drawBoard(mainBoard);
    drawLegalMoves();
    drawHeldPiece();
}


function drawBoard(board) {
    push();
    strokeWeight(0);
    let light = true;
    for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                    light = (r + c) % 2
                    fill(...[light ? [140, 162, 173] : [222, 227, 230]]);
                    square(c * squareWidth, r * squareWidth, squareWidth);
                    if (board.pieceArray[r][c]) {
                        drawPiece(r, c, board.pieceArray[r][c]);
                    }
            }
    }

    pop();
}


function windowResized() {
    canvasWidth = min(windowHeight, windowWidth) - 20;
    squareWidth = canvasWidth / 8;
    resizeCanvas(canvasWidth, canvasWidth);
}


function drawPiece(r, c, piece) {
    drawPieceScreen(r * squareWidth, c * squareWidth, piece);
}


function drawPieceScreen(rpx, cpx, piece) {
    if (piece.typeArray.length == 1)
        image(PIECES[piece.colour][piece.typeArray[0]],
            cpx, rpx, squareWidth, squareWidth);
}


function drawHeldPiece() {
    if (!heldPiece)
        return;

    drawTransparentSquare(heldPiece.r, heldPiece.c);
    drawPieceScreen(pointerY - squareWidth / 2, pointerX - squareWidth / 2, heldPiece);
}

function drawTransparentSquare(r, c, outlineOnly = false) {
    push();
    noFill();
    noStroke();
    lineWidth = squareWidth / 10
    strokeWeight(lineWidth);
    if (outlineOnly) {
        stroke(GREENSTROKE);
        square(
            c * squareWidth + lineWidth / 2,
            r * squareWidth + lineWidth / 2,
            squareWidth - lineWidth
        );
    }
    else {
        fill(GREENFILL);
        square(
            c * squareWidth,
            r * squareWidth,
            squareWidth
        );
    }
    pop();
}


function drawLegalMoves() {
    push();

    noStroke();
    fill(GREENSTROKE);
    let [r, c] = screenToBoardCoords();

    for (let move of legalMovesArr) {
        if (move[0] == r && move[1] == c)
            drawTransparentSquare(r, c);
        else if (mainBoard.pieceArray[move[0]][move[1]])
            drawTransparentSquare(...move, true);
        else
            circle(
                move[1] * squareWidth + squareWidth / 2,
                move[0] * squareWidth + squareWidth / 2,
                squareWidth / 4
            );
    }

    pop();
}