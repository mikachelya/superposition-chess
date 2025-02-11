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