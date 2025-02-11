class Board {
    constructor(pieceArray, currentMove = WHITE, enPassantTarget = null) {
        this.pieceArray = pieceArray;
        this.enPassantTarget = enPassantTarget;
        this.currentMove = currentMove;
        this.deletedPiece;
        this.lastMove;
        this.lastEnPassantTarget = undefined;
        this.lastPieceHasMoved;
    }

    getLegalMovesSimple(r, c, excludeChecks = true) {
        let resultArr = [];
        
        if (!this.pieceArray[r][c])
            return resultArr;
        
        let currentPiece = this.pieceArray[r][c]
        let currentPieceType = currentPiece.typeArray[0];
        let currentColour = currentPiece.colour;
        
        if ([ROOK, QUEEN, BISHOP].includes(currentPieceType)) {
            let moveDirections = SLIDINGPIECEMOVES[currentPieceType];
            for (let dir = 0; dir < moveDirections[0].length; dir++) {
                let currentR = r;
                let currentC = c;
                while (true) {
                    currentR += moveDirections[0][dir];
                    currentC += moveDirections[1][dir];
                    
                    if (currentR >= 8 || currentR < 0 || currentC >= 8 || currentC < 0)
                        break;
                    
                    if (this.pieceArray[currentR][currentC]) {
                        if (this.pieceArray[currentR][currentC].colour != currentColour)
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
                
                if (this.pieceArray[currentR][currentC]) {
                    if (this.pieceArray[currentR][currentC].colour != currentColour)
                        resultArr.push([currentR, currentC]);
                    continue;
                }

                resultArr.push([currentR, currentC]);
            }

            // castling
            if (currentPieceType == KING && !currentPiece.hasMoved && excludeChecks) {
                // find adjascent rooks
                let castlingPartners = {};
                let testC;
                for (let offset of [-1, 1]) {
                    for (testC = c + offset; testC >= 0 && testC < 8; testC += offset)
                        if (this.pieceArray[r][testC])
                            break;

                    // first piece has to be a rook of the same colour which hasn't moved
                    if (testC >= 0 && testC < 8 
                        && this.pieceArray[r][testC].typeArray[0] == ROOK
                        && this.pieceArray[r][testC].colour == currentColour
                        && this.pieceArray[r][testC].hasMoved == false)
                        castlingPartners[offset] = testC;
                }

                // filter out illegal castling
                castlingPartners = Object.entries(castlingPartners).filter(
                    ([dir, rookStart]) => {
                        let [kingDest, rookDest] = CASTLINGDESTINATIONS[dir];
                        // illegal if king would move through check
                        for (let i of range(c, kingDest, dir))
                            if (this.isCheck(currentColour, [r, i]))
                                return false;

                        let relevantSquares = [c, kingDest, rookStart, rookDest];
                        let skipSquares = [c, rookStart];
                        // illegal if king or rook would move through another piece
                        for (let i of range(min(relevantSquares), max(relevantSquares))) {
                            if (skipSquares.includes(i))
                                continue;
                            if (this.pieceArray[r][i])
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
            if (!this.pieceArray[r + direction][c]) {
                resultArr.push([r + direction, c]);

                // if the square in front of that one is also free, 
                // and the pawn hasn't moved yet, you can go there
                if ((currentColour == WHITE && r == 6 || currentColour == BLACK && r == 1) &&
                    !this.pieceArray[r + direction * 2][c])
                    resultArr.push([r + direction * 2, c]);
            }

            // capture diagonally (including en passant)
            for (let offsets of [[direction, -1], [direction, 1]]) {
                let nextR = r + offsets[0];
                let nextC = c + offsets[1];
                if (nextR >= 8 || nextR < 0 || nextC >= 8 || nextC < 0)
                    //return;
                    continue;

                if (this.pieceArray[nextR][nextC] && 
                    this.pieceArray[nextR][nextC].colour != currentColour ||
                    this.enPassantTarget &&
                    this.enPassantTarget[0] == nextR && this.enPassantTarget[1] == nextC)
                    resultArr.push([nextR, nextC]);
            }
        }

        // filter out moves that would leave the king in check
        if (excludeChecks)
            resultArr = resultArr.filter(move => {
                let currentPiece = this.pieceArray[move[0]][move[1]];
                // skip these checks for castling, as that has it's own logic
                if (currentPiece && currentPiece.colour == currentColour)
                    return true;
                // make the move
                this.makeMove(r, c, ...move, true);
                // check for a check
                let isValid = !this.isCheck(currentColour);
                // undo the move
                this.undoMove();
                return isValid;
            });

        return resultArr;
    }

    isCheck(colour, kingCoords = null) {
        if (!kingCoords) {
            let kingFound = false;
            for (let r = 0; r < 8 && !kingFound; r++) {
                for (let c = 0; c < 8; c++) {
                    if (this.pieceArray[r][c] && this.pieceArray[r][c].colour == colour && 
                        this.pieceArray[r][c].typeArray[0] == KING) {
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
                if (this.pieceArray[r][c] && this.pieceArray[r][c].colour != colour)
                    if (this.getLegalMovesSimple(r, c, false).some(e => e[0] == kingCoords[0] && e[1] == kingCoords[1]))
                        return true;
    
        return false
    }

    makeMove(sourceR, sourceC, targetR, targetC, ignore = false) {
        let currentPiece = this.pieceArray[sourceR][sourceC];
        this.deletedPiece = undefined;
        let legalMoves = [];

        if (!ignore)
            legalMoves = this.getLegalMovesSimple(sourceR, sourceC);
        if (ignore || legalMoves.some(([r, c]) => r == targetR && c == targetC)) {
            this.lastPieceHasMoved = currentPiece.hasMoved;
            currentPiece.hasMoved = true;
            
            // castling
            if (this.pieceArray[targetR][targetC] &&
                this.pieceArray[targetR][targetC].colour == currentPiece.colour) {
                this.pieceArray[currentPiece.r][currentPiece.c] = undefined;
                let rook = this.pieceArray[targetR][targetC];
                this.pieceArray[targetR][targetC] = undefined;
                let direction = targetC < sourceC ? "-1" : "1";
                let [kingDest, rookDest] = CASTLINGDESTINATIONS[direction];
                this.pieceArray[targetR][rookDest] = rook;
                this.pieceArray[targetR][kingDest] = currentPiece;
            }
            else {
                this.deletePiece(targetR, targetC);
                this.pieceArray[targetR][targetC] = currentPiece;
                this.pieceArray[sourceR][sourceC] = undefined;
            }
            
            // en passant
            if (this.enPassantTarget && 
                currentPiece.typeArray[0] == PAWN && 
                targetR == this.enPassantTarget[0] &&
                targetC == this.enPassantTarget[1])
                this.deletePiece(targetR - (this.currentMove == WHITE ? -1 : 1), targetC);
            
            // update en passant target
            if (currentPiece.typeArray[0] == PAWN && abs(sourceR - targetR) == 2)
                this.enPassantTarget = [(sourceR + targetR) / 2, targetC];
            else {
                this.lastEnPassantTarget = this.enPassantTarget;
                this.enPassantTarget = undefined;
            }
        
            // promote pawn to queen for now  
            if (currentPiece.typeArray[0] == PAWN && [0, 7].includes(targetR))
                this.pieceArray[targetR][targetC].typeArray[0] = QUEEN;
        
            // swap the active side
            this.currentMove = 1 - this.currentMove;
            this.lastMove = [sourceR, sourceC, targetR, targetC];

            return true;
        }
        return false;
    }

    undoMove() {
        this.pieceArray[this.lastMove[0]][this.lastMove[1]] 
            = this.pieceArray[this.lastMove[2]][this.lastMove[3]];
        this.pieceArray[this.lastMove[0]][this.lastMove[1]].hasMoved = this.lastPieceHasMoved;
        this.pieceArray[this.lastMove[2]][this.lastMove[3]] = undefined;
        if (this.deletedPiece)
            this.pieceArray[this.deletedPiece.r][this.deletedPiece.c] = this.deletedPiece;
        this.currentMove = 1 - this.currentMove;
        this.enPassantTarget = this.lastEnPassantTarget;
    }

    deletePiece(r, c) {
        if (!this.pieceArray[r][c]) {
            this.deletedPiece = undefined;
            return false;
        }

        this.deletedPiece = this.pieceArray[r][c];
        this.deletedPiece.r = r;
        this.deletedPiece.c = c;
        this.pieceArray[r][c] = undefined;
        return true;
    }
}


class Piece {
    constructor(typeArray, colour) {
        this.typeArray = typeArray;
        this.hasMoved = false;
        this.colour = colour;
        this.r; this.c;
    }
}