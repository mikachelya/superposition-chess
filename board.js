class Board {
    constructor(pieceArray) {
        this.pieceArray = pieceArray;
        this.enPassantTarget = null;
    }
}


class Piece {
    constructor(typeArray, colour) {
        this.typeArray = typeArray;
        this.hasMoved = false;
        this.colour = colour;
    }
}