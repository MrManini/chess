import { UI } from '../ui/UI.js';
import { Move } from './Move.js';
import { getAllLegalMoves, computeLegalMoves } from './LegalMoves.js';

export class Game {
    
    constructor(board) {
        this.board = board;
        this.sideToMove = 'white';
        this.gameOver = false;
        this.UI = new UI(this);
        this.whiteLegalMoves = [];
        this.blackLegalMoves = [];
        this.lastMove = null;
        this.movesPlayed = [];
        this.pgn = [];
    }

    start() {
        this.UI.enablePieceMovement();
        this.UI.handlePromotionMenu();
        this.updateLegalMoves();
    }

    handlePieceMove(piece, toSquare, capture = false, enPassant = false, promotion = null) {
        const move = new Move(
            piece,
            piece.square,
            toSquare,
            capture,
            enPassant,
            promotion
        );

        if (enPassant) {
            const { file, rank } = toSquare;
            const direction = piece.color === 'white' ? 1 : -1;
            const pawn = this.board.squares[file + (parseInt(rank) - direction)].getPiece();
            piece.captureEnPassant(pawn);
        } else if (promotion) {
            const { newPiece, newPieceElement } = piece.promote(promotion, toSquare, capture);
            if (this.color === 'white') {
                this.board.whiteAlivePieces.push(newPiece);
            } else {
                this.board.blackAlivePieces.push(newPiece);
            }
            newPieceElement.addEventListener('click', this.UI.handlePieceClick.bind(this.UI));
        } else if (capture) {
            piece.capture(toSquare.getPiece());
        } else {
            piece.move(toSquare, promotion);
        }
        this.UI.deselectPiece();

        this.movesPlayed.push(move);
        this.pgn.push(move.toString());
        console.log(this.pgn);
        this.lastMove = move;

        this.switchTurns();
        this.updateLegalMoves();
        const sideToMoveKing = this.sideToMove === 'white' ? this.board.whiteKing : this.board.blackKing;
        if (sideToMoveKing.isInCheckmate(this.sideToMove)) handleCheckmate(this.sideToMove, sideToMoveKing);
        if (sideToMoveKing.isInStalemate(this.sideToMove)) handleStalemate(this.sideToMove);
    }

    switchTurns() {
        this.sideToMove = this.sideToMove === 'white' ? 'black' : 'white';
    }

    updateLegalMoves() {
        computeLegalMoves(this.lastMove);
        const { whiteLegalMoves, blackLegalMoves } = getAllLegalMoves();
        this.whiteLegalMoves = whiteLegalMoves;
        this.blackLegalMoves = blackLegalMoves;
    }

    handleCheckmate(king) {
        const otherSide = king.color === 'white' ? 'black' : 'white';
        console.log(`Checkmate! ${otherSide} wins!`);
        gameOver = true;
        const kingSquareElement = document.getElementById(king.square.id);
        kingSquareElement.style.backgroundColor = '#a81a0c';
    }
    
    handleStalemate() {
        console.log("Stalemate. It's a draw.");
        gameOver = true;
        whiteKingSquareElement = document.getElementById(whiteKing.square.id);
        blackKingSquareElement = document.getElementById(blackKing.square.id);
        whiteKingSquareElement.style.backgroundColor = '#cdd26b';
        blackKingSquareElement.style.backgroundColor = '#cdd26b';
    }

}