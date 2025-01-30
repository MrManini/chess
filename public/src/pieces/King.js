import { Piece } from './Piece.js';
import { getAllPossibleMoves, getAllLegalMoves, updatePossibleMoves } from '../game/LegalMoves.js';
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

        let castleMove;
        if (this.canCastle('kingside')) {
            console.log(`${this.color} king can castle kingside`);
            castleMove = new Move(this, this.square, squares['g' + this.square.rank]);
            castleMove.setCastle('kingside');
            this.moves.push(castleMove);
        }
        if (this.canCastle('queenside')) {
            console.log(`${this.color} king can castle queenside`);
            castleMove = new Move(this, this.square, squares['c' + this.square.rank]);
            castleMove.setCastle('queenside');
            this.moves.push(castleMove);
        }
    }

    castle(side) {
        if (side === 'kingside') {
            const rook = board.squares['h' + this.square.rank].getPiece();
            const kingSquare = board.squares['g' + this.square.rank];
            const rookSquare = board.squares['f' + this.square.rank];
            this.move(kingSquare);
            rook.move(rookSquare);
        } else {
            const rook = board.squares['a' + this.square.rank].getPiece();
            const kingSquare = board.squares['c' + this.square.rank];
            const rookSquare = board.squares['d' + this.square.rank];
            this.move(kingSquare);
            rook.move(rookSquare);
        }
    }

    canCastle(side) {
        let emptySquares;
        const { files, squares } = board;
        const [file, rank] = this.square.getPosition();
        let rook;
        if (side === 'kingside') {
            emptySquares = [squares['f' + rank], squares['g' + rank]];
            rook = squares['h' + rank].getPiece();
        } else if (side === 'queenside') {
            emptySquares = [squares['b' + rank], squares['c' + rank], squares['d' + rank]];
            rook = squares['a' + rank].getPiece();
        }

        /*
        console.log(`------------------ ${this.color} king can castle ${side} ------------------`);
        console.log(`${this.color} king has moved: ${this.hasMoved}`);
        console.log(`rook exists: ${rook}`);
        if (rook) console.log(`rook has moved: ${rook.hasMoved}`);
        console.log(`king is in check: ${this.isInCheck}`);
        console.log(`empty squares are empty: ${emptySquares.every(square =>  square.isEmpty())}`);
        emptySquares.forEach(square => console.log(square.isEmpty()));
        console.log("Conclusion:");
        console.log(!this.hasMoved && rook && !rook.hasMoved && !this.isInCheck && emptySquares.every(square => { square.isEmpty() }));
        */
        return !this.hasMoved && rook && !rook.hasMoved && 
                !this.isInCheck && emptySquares.every(square => square.isEmpty());
    }

    computeCheck(capturedPiece = null, lastMove = null) {
        updatePossibleMoves(capturedPiece, lastMove);
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