let legalMovesArrary = [];
let squareWidth;
let heldPiece;
const GREEN = [12, 110, 51];
const GREENFILL = [...GREEN, 50];
const GREENSTROKE = [...GREEN, 150];
const YELLOW = [193, 211, 129, 150];
const PREMOVE = [69, 79, 120];
const PREMOVEFILL = [...PREMOVE, 50];
const PREMOVESTROKE = [...PREMOVE, 150];
const PREMOVEDONE = [...PREMOVE, 200];
let mainBoard;
let auxillaryBoardArray = [];
let newBoardArray = [];
let PIECEOFFSETS = {};
let perspective = WHITE;
let multiplayer = true;
let awaitingMatch = false;
let premove = false;
let premoveCoords = undefined;
let ws;

const moveMethod = localStorage.getItem("moveMethod") || "drag";
document.oncontextmenu = _ => false;
document.addEventListener('gesturestart', function (e) {e.preventDefault();});
document.addEventListener("touchstart", e => e.preventDefault(), {passive: false});

function preload() {
    PIECES = [
        [
            loadImage("resources/cburnett/wB.png"),
            loadImage("resources/cburnett/wK.png"),
            loadImage("resources/cburnett/wN.png"),
            loadImage("resources/cburnett/wP.png"),
            loadImage("resources/cburnett/wQ.png"),
            loadImage("resources/cburnett/wR.png"),
        ],
        [
            loadImage("resources/cburnett/bB.png"),
            loadImage("resources/cburnett/bK.png"),
            loadImage("resources/cburnett/bN.png"),
            loadImage("resources/cburnett/bP.png"),
            loadImage("resources/cburnett/bQ.png"),
            loadImage("resources/cburnett/bR.png"),
        ],
    ]
}


function setup() {
    if (multiplayer) {
        let room = window.location.search.slice(1);
        if (!room) {
            multiplayer = false;
        }
        else {
            // awaitingMatch = false;
            // perspective = BLACK
            awaitingMatch = true;
            perspective = establishConnection(room);
        }
    }

    // if (multiplayer) {
    //     document.querySelectorAll(".chess-clock").forEach(el => {
    //         el.style.display = "flex";
    //     });
    // }

    windowResized();
    textAlign(CENTER);
    // textFont('Times New Roman');

    createCanvas(canvasWidth, canvasWidth);
    mainBoard = boardFromFEN();

    if (vanilla)
        auxillaryBoardArray = [boardFromFEN(STARTINGFEN)];
    else
        auxillaryBoardArray = generateBoards();

    collectBoards();
}


function draw() {
    premove = multiplayer && mainBoard.currentMove != perspective;
    if (awaitingMatch) {
        push();
        fill(255);
        stroke(0);
        strokeWeight(1);
        rectMode(CENTER);
        textSize(squareWidth / 3);
        text("Awaiting player two. Click to copy link.", canvasWidth / 2, canvasWidth / 2);
        pop();
    }
    else {
        updatePointers();
        drawBoard();
        drawMove(YELLOW, mainBoard.lastMove);
        if (multiplayer)
            drawMove(PREMOVEDONE, premoveCoords);
        drawPieces(mainBoard);
        drawLegalMoves();
        drawHeldPiece();
    }
}


function drawBoard() {
    push();
    strokeWeight(0);
    let light = true;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            light = (r + c) % 2
            fill(...[light ? [140, 162, 173] : [222, 227, 230]]);
            let [tempR, tempC] = perspectiveCoords(r, c);
            square(tempC * squareWidth, tempR * squareWidth, squareWidth);
        }
    }

    pop();
}


function drawPieces(board) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            let [tempR, tempC] = perspectiveCoords(r, c);
            if (board.pieceArray[r][c])
                drawPiece(tempR, tempC, board.pieceArray[r][c]);
        }
    }
}


function drawMove(colour, move) {
    if (!move) return;
    for (let square of [move.slice(0,2), move.slice(2,4)]) {
        //if (!heldPiece || !compareCoords(square, screenToBoardCoords())) {
            drawTransparentSquare(...square, false, colour);
        //}
    }
}


function windowResized() {
    canvasWidth = min(windowHeight, windowWidth) - 20;
    squareWidth = canvasWidth / 8;
    updatePieceOffsets();
    resizeCanvas(canvasWidth, canvasWidth);
    document.querySelector(".chessboard").style.setProperty("--board-size", `${canvasWidth}px`);
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

    drawTransparentSquare(heldPiece.r, heldPiece.c, false, premove ? PREMOVEFILL : GREENFILL);
    drawPieceScreen(pointerY - squareWidth / 2, pointerX - squareWidth / 2, heldPiece);
}

function drawTransparentSquare(r, c, outlineOnly = false, colour = GREENFILL) {
    [r, c] = perspectiveCoords(r, c);
    let premove = multiplayer && mainBoard.currentMove != perspective;

    push();
    noFill();
    noStroke();
    lineWidth = squareWidth / 10
    strokeWeight(lineWidth);
    if (outlineOnly) {
        stroke(premove ? PREMOVESTROKE : GREENSTROKE);
        square(
            c * squareWidth + lineWidth / 2,
            r * squareWidth + lineWidth / 2,
            squareWidth - lineWidth
        );
    }
    else {
        fill(colour);
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
    fill(premove ? PREMOVESTROKE : GREENSTROKE);
    let fillColour = premove ? PREMOVEFILL : GREENFILL
    let [r, c] = screenToBoardCoords();

    for (let move of legalMovesArrary) {
        if (move[0] == r && move[1] == c)
            drawTransparentSquare(r, c, false, fillColour);
        else if (mainBoard.pieceArray[move[0]][move[1]])
            drawTransparentSquare(...move, true, fillColour);
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