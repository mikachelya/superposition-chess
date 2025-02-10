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

CASTLINGDESTINATIONS = [
    [2, 3],
    [6, 5],
];


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
            currentR = r;
            currentC = c;
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
        moveDirections = JUMPINGPIECEMOVES[currentPieceType];
        for (let dir = 0; dir < moveDirections[0].length; dir++) {
            currentR = r + moveDirections[0][dir];
            currentC = c + moveDirections[1][dir];
            
            if (currentR >= 8 || currentR < 0 || currentC >= 8 || currentC < 0)
                continue;
            
            if (board.pieceArray[currentR][currentC]) {
                if (board.pieceArray[currentR][currentC].colour != currentColour)
                    resultArr.push([currentR, currentC]);
                continue;
            }

            resultArr.push([currentR, currentC]);
        }

        // if (currentPieceType == KING && !currentPiece.hasMoved) {
        //     // if there is a rook on the left
        //     castlingPartners = {}
        //     let testC;
        //     for (let offset of [-1, 1]) {
        //         for (testC = c; c >= 0 && c < 8; c += offset) {
        //             if (board.pieceArray[r][testC] && board.pieceArray[r][testC] != ROOK)
        //                 break;
        //             if (board.pieceArray[r][testC].hasMoved)
        //                 break;
        //         }
        //         castlingPartners[offset] = testC;
        //     }

        //     for (let [dir, col] of Object.entries(castlingPartners)) {

        //     }
        // }
    }

    else if (currentPieceType == PAWN) {
        direction = (currentColour == WHITE ? -1 : 1);
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
            nextR = r + offsets[0];
            nextC = c + offsets[1];
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
    
    if (excludeChecks)
        resultArr = resultArr.filter(move => {
            // make the move
            let temp = board.pieceArray[move[0]][move[1]];
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

    console.log("king at", kingCoords);

    for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++)
            if (board.pieceArray[r][c] && board.pieceArray[r][c].colour != colour)
                if (getLegalMovesSimple(board, r, c, false).some(e => e[0] == kingCoords[0] && e[1] == kingCoords[1]))
                    return true;

    return false
}


function* range(start, end, step = 1) {
    if (step > 0)
        for (let i = start; i <= end; i += step)
            yield i;
    if (step < 0)
        for (let i = start; i >= end; i += step)
            yield i;
}