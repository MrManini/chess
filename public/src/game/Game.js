import { UI } from '../ui/UI.js';
import { Move } from './Move.js';
import { getAllLegalMoves } from './LegalMoves.js';

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
        if (capture) {
            piece.capture(toSquare.getPiece());
        } else if (enPassant) {
            piece.captureEnPassant(toSquare.getPiece());
        } else {
            piece.move(toSquare, capture, promotion);
        }
        this.UI.deselectPiece();

        const move = new Move({
            piece,
            from: piece.square,
            to: toSquare,
            capture,
            promotion
        });

        this.movesPlayed.push(move);
        this.pgn.push(move.toString());
        console.log(this.pgn);
        this.lastMove = move;

        this.switchTurns();
        this.updateLegalMoves();
        const sideToMoveKing = sideToMove === 'white' ? whiteKing : blackKing;
        if (sideToMoveKing.isInCheckmate()) handleCheckmate(sideToMoveKing);
        if (sideToMoveKing.isInStalemate()) handleStalemate();
    }

    switchTurns() {
        this.sideToMove = this.sideToMove === 'white' ? 'black' : 'white';
    }

    updateLegalMoves() {
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