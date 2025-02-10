const BISHOP = 0;
const KING = 1;
const KNIGHT = 2;
const PAWN = 3;
const QUEEN = 4;
const ROOK = 5;

const WHITE = 0;
const BLACK = 1;

SLIDINGPIECEMOVES = {}
SLIDINGPIECEMOVES[ROOK] = [
    [0,  1,  0, -1],
    [1,  0, -1,  0],
];
SLIDINGPIECEMOVES[BISHOP] = [
    [1,  1, -1, -1],
    [1, -1, -1,  1],
];
SLIDINGPIECEMOVES[QUEEN] = [
    [0,  1,  1,  1,  0, -1, -1, -1],
    [1,  1,  0, -1, -1, -1,  0,  1],
];

JUMPINGPIECEMOVES = {}
JUMPINGPIECEMOVES[KING] = SLIDINGPIECEMOVES[QUEEN];
JUMPINGPIECEMOVES[KNIGHT] = [
    [1,  2,  2,  1, -1, -2, -2, -1],
    [2,  1, -1, -2, -2, -1,  1,  2],
];

CASTLINGDESTINATIONS = {
    "-1": [2, 3],
     "1": [6, 5],
};


function getLegalMovesSimple(board, r, c, excludeChecks = true) {
    let resultArr = [];
    
    if (!board.pieceArray[r][c])
        return resultArr;
    
    let currentPiece = board.pieceArray[r][c]
    let currentPieceType = currentPiece.typeArray[0];
    let currentColour = currentPiece.colour;
    
    if ([ROOK, QUEEN, BISHOP].includes(currentPieceType)) {
        moveDirections = SLIDINGPIECEMOVES[currentPieceType];
        for (let dir = 0; dir < moveDirections[0].length; dir++) {
            let currentR = r;
            let currentC = c;
            while (true) {
                currentR += moveDirections[0][dir];
                currentC += moveDirections[1][dir];
                
                if (currentR >= 8 || currentR < 0 || currentC >= 8 || currentC < 0)
                    break;
                
                if (board.pieceArray[currentR][currentC]) {
                    if (board.pieceArray[currentR][currentC].colour != currentColour)
                        resultArr.push([currentR, currentC]);
                    break;
                }

                resultArr.push([currentR, currentC]);
            }
        }
    }

    else if ([KING, KNIGHT].includes(currentPieceType)) {
        let moveDirections = JUMPINGPIECEMOVES[currentPieceType];
        for (let dir = 0; dir < moveDirections[0].length; dir++) {
            let currentR = r + moveDirections[0][dir];
            let currentC = c + moveDirections[1][dir];
            
            if (currentR >= 8 || currentR < 0 || currentC >= 8 || currentC < 0)
                continue;
            
            if (board.pieceArray[currentR][currentC]) {
                if (board.pieceArray[currentR][currentC].colour != currentColour)
                    resultArr.push([currentR, currentC]);
                continue;
            }

            resultArr.push([currentR, currentC]);
        }

        if (currentPieceType == KING && !currentPiece.hasMoved && excludeChecks) {
            // find adjascent rooks
            let castlingPartners = {};
            let testC;
            for (let offset of [-1, 1]) {
                for (testC = c + offset; testC >= 0 && testC < 8; testC += offset)
                    if (board.pieceArray[r][testC])
                        break;

                // first piece has to be a rook of the same colour which hasn't moved
                if (testC >= 0 && testC < 8 
                    && board.pieceArray[r][testC].typeArray[0] == ROOK
                    && board.pieceArray[r][testC].colour == currentColour
                    && board.pieceArray[r][testC].hasMoved == false)
                    castlingPartners[offset] = testC;
            }

            // filter out illegal castling
            castlingPartners = Object.entries(castlingPartners).filter(
                ([dir, rookStart]) => {
                    let [kingDest, rookDest] = CASTLINGDESTINATIONS[dir];
                    // illegal if king would move through check
                    for (let i of range(c, kingDest, dir))
                        if (isCheck(board, currentColour, [r, i]))
                            return false;

                    let relevantSquares = [c, kingDest, rookStart, rookDest];
                    // illegal if king or rook would move through another piece
                    for (let i of range(min(relevantSquares), max(relevantSquares))) {
                        if (relevantSquares.includes(i))
                            continue;
                        if (board.pieceArray[r][i])
                            return false;
                    }
                    return true;
                }
            )

            // add the square where the rook is to the legal moves
            for (let keyVal of castlingPartners)
                resultArr.push([r, keyVal[1]]);
        }
    }

    else if (currentPieceType == PAWN && r != 0 && r != 7) {
        let direction = (currentColour == WHITE ? -1 : 1);
        // if the square in front is free, you can go there
        if (!board.pieceArray[r + direction][c]) {
            resultArr.push([r + direction, c]);

            // if the square in front of that one is also free, 
            // and the pawn hasn't moved yet, you can go there
            if ((currentColour == WHITE && r == 6 || currentColour == BLACK && r == 1) &&
                !board.pieceArray[r + direction * 2][c])
                resultArr.push([r + direction * 2, c]);
        }

        // capture diagonally (including en passant)
        for (let offsets of [[direction, -1], [direction, 1]]) {
            let nextR = r + offsets[0];
            let nextC = c + offsets[1];
            if (nextR >= 8 || nextR < 0 || nextC >= 8 || nextC < 0)
                //return;
                continue;

            if (board.pieceArray[nextR][nextC] && 
                board.pieceArray[nextR][nextC].colour != currentColour ||
                board.enPassantTarget &&
                board.enPassantTarget[0] == nextR && board.enPassantTarget[1] == nextC)
                resultArr.push([nextR, nextC]);
        }
    }
    
    // filter out moves that would leave the king in check
    if (excludeChecks)
        resultArr = resultArr.filter(move => {
            let temp = board.pieceArray[move[0]][move[1]];
            // skip these checks for castling, as that has it's own logic
            if (temp && temp.colour == currentColour)
                return true;
            // make the move
            board.pieceArray[move[0]][move[1]] = currentPiece;
            board.pieceArray[r][c] = undefined;
            // check for a check
            let isValid = !isCheck(board, currentColour);
            // undo the move
            board.pieceArray[r][c] = currentPiece;
            board.pieceArray[move[0]][move[1]] = temp;
            return isValid;
        });

    return resultArr;
}


function isCheck(board, colour, kingCoords = null) {
    if (!kingCoords) {
        let kingFound = false;
        for (let r = 0; r < 8 && !kingFound; r++) {
            for (let c = 0; c < 8; c++) {
                if (board.pieceArray[r][c] && board.pieceArray[r][c].colour == colour && 
                    board.pieceArray[r][c].typeArray[0] == KING) {
                    kingCoords = [r, c];
                    kingFound = true;
                    break;
                }
            }
        }   

        if (!kingCoords)
            return false;
    }

    for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++)
            if (board.pieceArray[r][c] && board.pieceArray[r][c].colour != colour)
                if (getLegalMovesSimple(board, r, c, false).some(e => e[0] == kingCoords[0] && e[1] == kingCoords[1]))
                    return true;

    return false
}


function* range(start, end, step = 1) {
    if (step > 0)
        for (let i = start; i <= end; i += +step)
            yield i;
    if (step < 0)
        for (let i = start; i >= end; i += +step)
            yield i;
}