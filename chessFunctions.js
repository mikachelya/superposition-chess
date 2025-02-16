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

LETTERTOPIECE = {
    "r": ROOK,
    "n": KNIGHT,
    "b": BISHOP,
    "q": QUEEN,
    "k": KING,
    "p": PAWN,
}

STARTINGFEN = "rnbqkbnr/pppppppp/PPPPPPPP/RNBQKBNR";


function* range(start, end, step = 1) {
    if (step > 0)
        for (let i = start; i <= end; i += +step)
            yield i;
    if (step < 0)
        for (let i = start; i >= end; i += +step)
            yield i;
}


function boardFromFEN(fen) {
    let grid = newEmptyGrid();

    if (fen) {
        let config = fen.split(" ")[0].split("/");
        let startingRows = [0, 1, 6, 7];
        for (let row in config)
            for (let letter in config[row])
                grid[startingRows[row]][letter] =
                    new Piece([LETTERTOPIECE[config[row][letter].toLowerCase()]],
                        config[row][letter] == config[row][letter].toUpperCase() ? WHITE : BLACK);
    }

    return new Board(grid);
}


let newEmptyGrid = _ => [...Array(8)].map(_ => Array(8));
let compareCoords = (a, b) => a[0] == b[0] && a[1] == b[1];
let matchCoord = a => (b => compareCoords(a, b));


function collectBoards() {
    mainBoard.pieceArray = newEmptyGrid();

    for (let board of auxillaryBoardArray) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (!board.pieceArray[r][c])
                    continue;
                if (mainBoard.pieceArray[r][c] && 
                    !mainBoard.pieceArray[r][c].typeArray.includes(board.pieceArray[r][c].typeArray[0]))
                    mainBoard.pieceArray[r][c].typeArray.push(board.pieceArray[r][c].typeArray[0]);
                else if (!mainBoard.pieceArray[r][c])
                    mainBoard.pieceArray[r][c] = new Piece([board.pieceArray[r][c].typeArray[0]], board.pieceArray[r][c].colour);
            }
        }
    }
}


function collectMoves(r, c, premove) {
    legalMovesArrary = [];

    for (let board of auxillaryBoardArray) {
        for (let move of board.getLegalMoves(r, c, true, premove))
            if (!legalMovesArrary.some(matchCoord(move)))
                legalMovesArrary.push(move);
    }
}


function makeMoves(move) {
    newBoardArray = [];
    auxillaryBoardArray = auxillaryBoardArray.filter(board => board.makeMove(...move));
    auxillaryBoardArray.push(...newBoardArray);
    mainBoard.currentMove = 1 - mainBoard.currentMove;
    mainBoard.lastMove = move;
    collectBoards();
}


function stringToBoard(string) {
    let grid = newEmptyGrid();

    for (let row of [0, 1, 6, 7])
        for (let letter in string)
            grid[row][letter] =
                new Piece([[0, 7].includes(row) ? LETTERTOPIECE[string[letter].toLowerCase()] : PAWN],
                    row > 1 ? WHITE : BLACK);

    return new Board(grid);
}


function cloneBoard(board) {
    let newBoard = new Board(structuredClone(board.pieceArray), board.currentMove);
    newBoard.lastMove = board.lastMove;
    newBoard.deletedPiece = board.deletedPiece;
    newBoard.lastPieceHasMoved = board.lastPieceHasMoved;
    return newBoard;
}


function generateBoards(array = [], depth = 0) {
    result = [];

    switch (depth) {
    // Dark-square bishop
    case 0:
        for (let index of [0, 2, 4, 6]) {
            let string = new Array(8);
            string[index] = "B";
            result.push(string);
        }
        break;

    // Light-square Bishop
    case 1:
        for (let currentString of array) {
            for (let index of [1, 3, 5, 7]) {
                let nextString = [...currentString];
                nextString[index] = "B";
                result.push(nextString);
            }
        }
        break;

    // Queen
    case 2:
        for (let currentString of array) {
            for (let index in currentString) {
                if (!currentString[index]) {
                    let nextString = [...currentString];
                    nextString[index] = "Q";
                    result.push(nextString);
                }
            }
        }
        break;

    // Knights
    case 3:
        for (let currentString of array) {
            let openIndices = Array.from(currentString.keys()).filter(e => !currentString[e]);
            for (let index1 in openIndices.slice(0, -1)) {
                for (let index2 of openIndices.slice(+index1 + 1)) {
                    let nextString = [...currentString];
                    nextString[openIndices[index1]] = "N";
                    nextString[index2] = "N";
                    result.push(nextString);
                }       
            }
        }
        break;

    // Rooks and King
    case 4:
        for (let currentString of array) {
            let openIndices = Array.from(currentString.keys()).filter(e => !currentString[e]);
            currentString[openIndices[0]] = "R";
            currentString[openIndices[1]] = "K";
            currentString[openIndices[2]] = "R";
            result.push(currentString);
        }
        return result.map(stringToBoard);
    }

    return generateBoards(result, depth + 1);
}