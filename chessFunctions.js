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


function getLegalMovesSimple(board, r, c) {
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

        if (currentPieceType == KING) {
            // TODO: castling
        }
    }

    else if (currentPieceType == PAWN) {
        direction = (currentColour == WHITE ? -1 : 1);
        // if the square in front is free, you can go there
        if (!board.pieceArray[r + direction][c]) {
            resultArr.push([r + direction, c]);

            // if the square in front of that one is also free, 
            // and the pawn hasn't moved yet, you can go there
            if (!currentPiece.hasMoved && !board.pieceArray[r + direction * 2][c])
                resultArr.push([r + direction * 2, c]);
        }

        // [[direction, -1], [direction, 1]].forEach(nextR, nextC => {
            
        // });
        // if it has, one square
        // capture diagonally (including en passant)
    }


    return resultArr;
}


function isCheck(board, colour) {

}