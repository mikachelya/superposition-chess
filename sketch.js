let legalMovesArrary = [];
let squareWidth;
let heldPiece;
let GREEN = [12, 110, 51];
let GREENFILL = [...GREEN, 50];
let GREENSTROKE = [...GREEN, 150];
let mainBoard;
let auxillaryBoardArray = [];
let newBoardArray = [];
let PIECEOFFSETS = {};
let perspective = BLACK;

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
    squareWidth = canvasWidth / 8;
    updatePieceOffsets();

    createCanvas(canvasWidth, canvasWidth);
    mainBoard = boardFromFEN();

    if (vanilla)
        auxillaryBoardArray = [boardFromFEN(STARTINGFEN)];
    else
        auxillaryBoardArray = generateBoards();


    // let grid = newEmptyGrid();
    // grid[1][5] = new Piece([KING], BLACK);
    // grid[7][7] = new Piece([KING], WHITE);
    // grid[7][6] = new Piece([ROOK], WHITE);
    // grid[1][1] = new Piece([PAWN], WHITE);
    // grid[6][1] = new Piece([PAWN], BLACK);
    // auxillaryBoardArray.push(new Board(grid));

    // auxillaryBoardArray.push(boardFromFEN(STARTINGFEN));
    
    collectBoards();
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
            let [tempR, tempC] = perspectiveCoords(r, c);
            square(tempC * squareWidth, tempR * squareWidth, squareWidth);
            if (board.pieceArray[r][c]) {
                drawPiece(tempR, tempC, board.pieceArray[r][c]);
            }
        }
    }

    pop();
}


function windowResized() {
    canvasWidth = min(windowHeight, windowWidth) - 20;
    squareWidth = canvasWidth / 8;
    updatePieceOffsets();
    resizeCanvas(canvasWidth, canvasWidth);
}


function updatePieceOffsets() {
    let offset = squareWidth / 2;

    PIECEOFFSETS = {
        [BISHOP]: [0, 0],
        [ROOK]: [0, offset],
        [KNIGHT]: [offset, 0],
        [QUEEN]: [offset, offset],
    }
}


function drawPiece(r, c, piece) {
    drawPieceScreen(r * squareWidth, c * squareWidth, piece);
}


function drawPieceScreen(rpx, cpx, piece) {
    let numPieces = piece.typeArray.length;
    let pieceArray = piece.typeArray.sort();

    if (numPieces == 1)
        image(PIECES[piece.colour][pieceArray[0]],
            cpx, rpx, squareWidth, squareWidth);

    else if (numPieces == 2) {
        image(PIECES[piece.colour][pieceArray[0]],
            cpx, rpx + squareWidth / 4 , squareWidth / 2, squareWidth / 2);
        image(PIECES[piece.colour][pieceArray[1]],
            cpx + squareWidth / 2, rpx + squareWidth / 4 , squareWidth / 2, squareWidth / 2);
    }

    else {
        for (let [pieceType, offsets] of Object.entries(PIECEOFFSETS)) {
            if (pieceArray.includes(+pieceType))
                image(PIECES[piece.colour][pieceType],
                    cpx + offsets[1], rpx + offsets[0], squareWidth / 2, squareWidth / 2);
        }

        // ensure king drawn last
        if (pieceArray.includes(KING))
            image(PIECES[piece.colour][KING],
                cpx + squareWidth / 4, rpx + squareWidth / 4, squareWidth / 2, squareWidth / 2);
    }
}


function drawHeldPiece() {
    if (!heldPiece)
        return;

    drawTransparentSquare(heldPiece.r, heldPiece.c);
    drawPieceScreen(pointerY - squareWidth / 2, pointerX - squareWidth / 2, heldPiece);
}

function drawTransparentSquare(r, c, outlineOnly = false) {
    [r, c] = perspectiveCoords(r, c);

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

    for (let move of legalMovesArrary) {
        if (move[0] == r && move[1] == c)
            drawTransparentSquare(r, c);
        else if (mainBoard.pieceArray[move[0]][move[1]])
            drawTransparentSquare(...move, true);
        else {
            let [tempR, tempC] = perspectiveCoords(...move);
            circle(
                tempC * squareWidth + squareWidth / 2,
                tempR * squareWidth + squareWidth / 2,
                squareWidth / 4
            );
        }
    }

    pop();
}