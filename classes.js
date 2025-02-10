class Board {
    constructor(pieceArray, currentMove = WHITE, enPassantTarget = null) {
        this.pieceArray = pieceArray;
        this.enPassantTarget = enPassantTarget;
        this.currentMove = currentMove
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


// class HeldPiece extends Piece {
//     construcor(typeArray, colour, r, c) {
//         super(typeArray);
//         super(colour);
//         this.r = r;
//         this.c = c;
//     }
// }