let pointerX = undefined;
let pointerY = undefined;
let currentTouch = undefined;

const matchTouch = (touch) => currentTouch && touch.id == currentTouch.id;
mousePressed = inputPressed;
mouseReleased = inputReleased;


function touchStarted() {
    if (!currentTouch)
        currentTouch = touches[0];
    updatePointers();
    inputPressed();
}


function touchEnded() {
    if (touches.some(matchTouch))
        return;

    currentTouch = undefined;
    inputReleased();
}


function touchMoved() {
    currentTouch = touches.find(matchTouch);
}


function inputPressed() {
    let [r, c] = screenToBoardCoords();

    if (!mainBoard.pieceArray[r][c] || mainBoard.currentMove != mainBoard.pieceArray[r][c].colour)
        return false;

    //legalMovesSet = mainBoard.getLegalMovesSimple(r, c);
    collectMoves(r, c);
    heldPiece = mainBoard.pieceArray[r][c];
    heldPiece.r = r; heldPiece.c = c;


    console.log(mainBoard.pieceArray);

    return false;
}


function inputReleased() {
    let [targetR, targetC] = screenToBoardCoords();
    if (!heldPiece)
        return;
    
    if (legalMovesArrary.some(matchCoord([targetR,targetC])))
        makeMoves([heldPiece.r, heldPiece.c, targetR, targetC]);
    
    heldPiece = undefined;
    legalMovesArrary = new Set;
}


function screenToBoardCoords() {
    r = (pointerY / squareWidth) >> 0;
    c = (pointerX / squareWidth) >> 0;
    return [r, c];
}


function updatePointers() {
    if (currentTouch) {
        pointerX = currentTouch.x;
        pointerY = currentTouch.y;
    }
    else {
        pointerX = mouseX;
        pointerY = mouseY;
    }
}