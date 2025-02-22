let pointerX = undefined;
let pointerY = undefined;
let currentTouch = undefined;

const matchTouch = (touch) => currentTouch && touch.id == currentTouch.id;
mousePressed = _ => {if (mouseButton == LEFT) inputPressed()};
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
    if (awaitingMatch) {
        navigator.clipboard.writeText(window.location.href);
        return false;
    }

    let [r, c] = screenToBoardCoords();

    if (selectedPieceCoords) {
        if (!compareCoords(selectedPieceCoords, [r, c]))
            attemptMove(r, c);
        legalMovesArrary = [];
    }

    if (!mainBoard.pieceArray[r][c]
        || !multiplayer && mainBoard.currentMove != mainBoard.pieceArray[r][c].colour
        ||  multiplayer && mainBoard.pieceArray[r][c].colour != perspective)
        return false;

    collectMoves(r, c, premove);
    heldPiece = mainBoard.pieceArray[r][c];
    heldPiece.r = r; heldPiece.c = c;
    if (moveMethod == "click") {
        if (selectedPieceCoords && compareCoords(selectedPieceCoords, [r, c])) {
            selectedPieceCoords = [];
            legalMovesArrary = [];
            heldPiece = undefined;
        }
        else
            selectedPieceCoords = [r, c];
    }
    return false;
}


function inputReleased() {
    if (moveMethod == "click")
        return;

    let [targetR, targetC] = screenToBoardCoords();
    if (!heldPiece)
        return;

    if (heldPiece.r == targetR && heldPiece.c == targetC) {
        if (moveMethod == "drag") {
            legalMovesArrary = [];
            heldPiece = undefined;
        }
        else
            selectedPieceCoords = [heldPiece.r, heldPiece.c];
        premoveCoords = undefined;
        return;
    }
    
    attemptMove(targetR, targetC);
    
    heldPiece = undefined;
    legalMovesArrary = [];
}


function attemptMove(targetR, targetC) {
    let success = false;
    if (legalMovesArrary.some(matchCoord([targetR,targetC]))) {
        let move = [heldPiece.r, heldPiece.c, targetR, targetC];
        if (premove)
            premoveCoords = move;
        else {
            success = true;
            makeMoves(move);
            mainBoard.lastMove = [heldPiece.r, heldPiece.c, targetR, targetC];
            if (multiplayer)
                sendMove(move);
        }
    }
    else if (premove)
        premoveCoords = undefined;
    return success;
}


function screenToBoardCoords() {
    let r = (pointerY / squareWidth) >> 0;
    let c = (pointerX / squareWidth) >> 0;

    [r, c] = perspectiveCoords(r, c);

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


function perspectiveCoords(r, c) {
    if (perspective == BLACK) {
        r = 7 - r;
        c = 7 - c;
    }
    return [r, c];
}