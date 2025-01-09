import Piece from './Piece.js';

export class Queen extends Piece {
    constructor(color, square) {
        super('queen', color, square);
    }

    getPossibleMoves() {
        this.moves = [];
        const tempRook = new Rook(this.color, this.square);
        const tempBishop = new Bishop(this.color, this.square);
        tempRook.getPossibleMoves();
        tempRook.moves.forEach(move => {
            const newMove = new Move(this, this.square, move.to);
            if (move.isCapture) {
                newMove.setCapture();
            }
            this.moves.push(newMove);
        });

        tempBishop.getPossibleMoves();
        tempBishop.moves.forEach(move => {
            const newMove = new Move(this, this.square, move.to);
            if (move.isCapture) {
                newMove.setCapture();
            }
            this.moves.push(newMove);
        });
    }
}