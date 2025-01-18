import { Piece } from './Piece.js';

export class Rook extends Piece {
    constructor(color, square) {
        super('rook', color, square);
        this.hasMoved = false;
    }

    getPossibleMoves() {
        this.moves = [];
        getLinearMoves(this, this.square, [[0, 1], [0, -1], [1, 0], [-1, 0]]);
    }
}