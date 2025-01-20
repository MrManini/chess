import { Piece } from './Piece.js';
import { getAllPossibleMoves, getAllLegalMoves, computePossibleMoves } from '../game/LegalMoves.js';
import { Move } from '../game/Move.js';
import Board from '../board/Board.js';

let board;

export class King extends Piece {
    constructor(color, square) {
        super('king', color, square);
        this.hasMoved = false;
        this.isInCheck = false;
    }

    getPossibleMoves() {
        if (!board) board = Board.getInstance();
        const { files, squares} = board;
        this.moves = [];
        const [fromFile, fromRank] = this.square.getPosition();
        const kingMoves = [     // All possible king moves
            [fromFile + 1, fromRank], [fromFile - 1, fromRank],
            [fromFile, fromRank + 1], [fromFile, fromRank - 1],
            [fromFile + 1, fromRank + 1], [fromFile + 1, fromRank - 1],
            [fromFile - 1, fromRank + 1], [fromFile - 1, fromRank - 1]
        ];
        kingMoves.forEach((kingMove) => {
            const [file, rank] = kingMove;
            if (file >= 0 && file <= 7 && rank >= 1 && rank <= 8) {
                let toSquare = squares[files[file] + rank];
                let move = new Move(this, this.square, toSquare);
                if (toSquare && toSquare.isEmpty()) {
                    // No piece on the target square, add move
                    this.moves.push(move); 
                } else if (toSquare.piece.color !== this.color) {
                    // Piece of the opposite color on the target square, add capture
                    move.setCapture();
                    this.moves.push(move);
                }
            }
        });
    }

    computeCheck(capturedPiece = null, lastMove = null) {
        computePossibleMoves(capturedPiece, lastMove);
        const { whitePossibleMoves, blackPossibleMoves } = getAllPossibleMoves();
        if (!board) board = Board.getInstance();
        const opponentMoves = this.color === 'white' ? blackPossibleMoves : whitePossibleMoves;
        this.isInCheck = opponentMoves.some(move => move.to === this.square);
    }

    isInCheckmate(sideToMove) {
        const { whiteLegalMoves, blackLegalMoves } = getAllLegalMoves();
        const sideToMoveLegalMoves = sideToMove === 'white' ? whiteLegalMoves : blackLegalMoves;
        return this.isInCheck && sideToMoveLegalMoves.length === 0;
    }

    isInStalemate(sideToMove) {
        const { whiteLegalMoves, blackLegalMoves } = getAllLegalMoves();
        const sideToMoveLegalMoves = sideToMove === 'white' ? whiteLegalMoves : blackLegalMoves;
        return !this.isInCheck && sideToMoveLegalMoves.length === 0;
    }
}