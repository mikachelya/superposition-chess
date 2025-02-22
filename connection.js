function establishConnection(room) {
    ws = new WebSocket("wss://beemc.chickenkiller.com:4443/chess/" + room);
    window.addEventListener("beforeunload", _ => ws.close());

    ws.onmessage = message => {
        perspective = message.data == "true";
        awaitingMatch = false;
        ws.onmessage = receiveMove;
    };
}

function receiveMove(message) {
    let move = message.data;
    let [sourceR, sourceC, targetR, targetC] = [+move[0], +move[1], +move[2], +move[3]];
    collectMoves(sourceR, sourceC);
    if (legalMovesArrary.some(matchCoord([targetR,targetC])) 
        && mainBoard.currentMove != perspective 
        && mainBoard.pieceArray[move[0]][move[1]].colour != perspective)
        makeMoves([sourceR, sourceC, targetR, targetC]);
    else
        ws.close();

    legalMovesArrary = [];

    if (heldPiece
        && (!mainBoard.pieceArray[heldPiece.r][heldPiece.c] 
            || mainBoard.pieceArray[heldPiece.r][heldPiece.c].colour != perspective))
        heldPiece = undefined;

    if (premoveCoords) {
        collectMoves(premoveCoords[0], premoveCoords[1]);
        if (legalMovesArrary.some(matchCoord([premoveCoords[2], premoveCoords[3]])) && mainBoard.currentMove == perspective) {
            makeMoves(premoveCoords);
            mainBoard.lastMove = premoveCoords;
            sendMove(premoveCoords);
            heldPiece = undefined;
        }
        legalMovesArrary = [];
        premoveCoords = undefined;
    }

    else if (heldPiece)
        collectMoves(heldPiece.r, heldPiece.c, false);
}


let sendMove = (move) => ws.send("" + move[0] + move[1] + move[2] + move[3]);