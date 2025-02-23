let pointerX = undefined;
let pointerY = undefined;
let currentTouch = undefined;
let draggingPiece;

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
    
    if (moveMethod == "click" && premoveCoords || !mainBoard.pieceArray[r][c]) {
        premoveCoords = undefined;
    }
    
    let moved = false;
    if (selectedPieceCoords && selectedPieceCoords.length > 0) {
        if (!compareCoords(selectedPieceCoords, [r, c])) {
            moved = attemptMove(r, c);
            if (moved != 1) {
                heldPiece = undefined;
                selectedPieceCoords = [];
            }
        }
        legalMovesArrary = [];
    }
    
    if (moved) {
        selectedPieceCoords = [];
        heldPiece = undefined;
    }
    
    if (!mainBoard.pieceArray[r][c]
        || !multiplayer && mainBoard.currentMove != mainBoard.pieceArray[r][c].colour
        ||  multiplayer && mainBoard.pieceArray[r][c].colour != perspective)
        return false;

    if (!moved && moveMethod == "both")
        draggingPiece = true;
        
    if (!moved) {
        collectMoves(r, c, premove);
        heldPiece = mainBoard.pieceArray[r][c];
        heldPiece.r = r; heldPiece.c = c;
    }
    if (moveMethod == "click" && !moved)
        updateSelectedPiece(r, c);
    lastClickCoords = [r, c];
    return false;
}


function inputReleased() {
    if (moveMethod == "click")
        return;

    draggingPiece = false;

    let [targetR, targetC] = screenToBoardCoords();
    if (!heldPiece)
        return;

    if (heldPiece.r == targetR && heldPiece.c == targetC) {
        if (moveMethod == "drag") {
            legalMovesArrary = [];
            heldPiece = undefined;
        }
        else if (moveMethod == "both")
            updateSelectedPiece(targetR, targetC);
        premoveCoords = undefined;
        premove = false;
        return;
    }
    
    attemptMove(targetR, targetC);
    
    heldPiece = undefined;
    selectedPieceCoords = [];
    legalMovesArrary = [];
}


function updateSelectedPiece(r, c) {
    if (selectedPieceCoords && compareCoords(selectedPieceCoords, [r, c])) {
        selectedPieceCoords = [];
        legalMovesArrary = [];
        heldPiece = undefined;
    }
    else
        selectedPieceCoords = [r, c];
}


function attemptMove(targetR, targetC) {
    let success = 0;
    if (legalMovesArrary.some(matchCoord([targetR,targetC]))) {
        let move = [heldPiece.r, heldPiece.c, targetR, targetC];
        if (premove) {
            premoveCoords = move;
            success = 2; // premove
        }
        else {
            success = 1;
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