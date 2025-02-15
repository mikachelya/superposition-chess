function establishConnection(room) {
    ws = new WebSocket("wss://beemc.chickenkiller.com:4443/chess/" + room);
    //window.addEventListener("beforeunload", _ => ws.close());

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
    if (legalMovesArrary.some(matchCoord([targetR,targetC])) && mainBoard.currentMove != perspective)
        makeMoves([sourceR, sourceC, targetR, targetC]);
    else
        ws.close();
    legalMovesArrary = [];
}