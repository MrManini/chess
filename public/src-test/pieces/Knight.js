import { Piece } from './Piece.js';
import { Move } from '../game/Move.js';
import Board from '../board/Board.js';

let board;

export class Knight extends Piece {
    constructor(color, square) {
        super('knight', color, square);
    }

    getPossibleMoves() {
        if (!board) board = Board.getInstance();
        const { files, squares } = board;
        this.moves = [];
        const [fromFile, fromRank] = this.square.getPosition();
        const knightMoves = [   // All possible knight moves
            [fromFile + 2, fromRank + 1], [fromFile + 2, fromRank - 1],
            [fromFile - 2, fromRank + 1], [fromFile - 2, fromRank - 1],
            [fromFile + 1, fromRank + 2], [fromFile + 1, fromRank - 2],
            [fromFile - 1, fromRank + 2], [fromFile - 1, fromRank - 2]
        ];
        knightMoves.forEach((knightMove) => {
            const [file, rank] = knightMove;  
            if (file >= 0 && file <= 7 && rank >= 1 && rank <= 8) {
                let toSquare = squares[files[file] + rank];
                let move = new Move(this, this.square, toSquare);
                if (toSquare && toSquare.isEmpty()) {
                    this.moves.push(move);
                } else if (toSquare.piece.color !== this.color) {
                    move.setCapture();
                    this.moves.push(move);
                }
            }
        });        
    }
}