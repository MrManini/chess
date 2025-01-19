import { Piece } from './Piece.js';
import { getLinearMoves } from '../game/LegalMoves.js';

export class Bishop extends Piece {
    constructor(color, square) {
        super('bishop', color, square);
    }

    getPossibleMoves() {
        this.moves = [];
        getLinearMoves(this, this.square, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
    }
}