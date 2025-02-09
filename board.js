class Board {
    constructor(pieceArray) {
        this.pieceArray = pieceArray;
    }
}


class Piece {
    constructor(type) {
        this.type = type;
        this.hasMoved = false;
    }
}