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
        console.log(`Piece object type: ${piece.constructor.name}`);
        console.log(piece);
        
        const move = new Move(
            piece,
            piece.square,
            toSquare,
            capture,
            enPassant,
            promotion
        );

        console.log(`Move object type: ${move.constructor.name}`);
        console.log(move);

        console.log(`Move piece object type: ${move.piece.constructor.name}`);
        console.log(move.piece);

        if (capture) {
            piece.capture(toSquare.getPiece());
        } else if (enPassant) {
            piece.captureEnPassant(toSquare.getPiece());
        } else {
            piece.move(toSquare, capture, promotion);
        }
        this.UI.deselectPiece();

        this.movesPlayed.push(move);
        this.pgn.push(move.toString());
        console.log(this.pgn);
        this.lastMove = move;

        this.switchTurns();
        this.updateLegalMoves();
        const sideToMoveKing = this.sideToMove === 'white' ? this.board.whiteKing : this.board.blackKing;
        if (sideToMoveKing.isInCheckmate()) handleCheckmate(this.sideToMove, sideToMoveKing);
        if (sideToMoveKing.isInStalemate()) handleStalemate(this.sideToMove);
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