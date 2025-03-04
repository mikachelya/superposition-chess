function establishConnection(room) {
    ws = new WebSocket("wss://beemc.chickenkiller.com:4443/chess/" + room);
    // ws = new WebSocket("ws://140.238.209.219:80");
    // ws = new WebSocket("ws://localhost:80");
    window.addEventListener("beforeunload", _ => ws.close());

    // ws.onopen = _ => {
        // ws.send(room);
    // };

    ws.onmessage = message => {
        perspective = message.data == "true";
        awaitingMatch = false;
        if (timeControl)
            initialiseTimers();
        ws.onmessage = receiveMove;
    };
}


function receiveMove(message) {
    message = JSON.parse(message.data);
    console.log(message);
    message.origin = +message.origin;

    if (timeControl)
        updateTimers(message);

    let move = message.contents;
    let origin = message.origin;

    if (origin == perspective) {
        return;
    }

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