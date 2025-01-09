import { UI } from '../ui/UI.js';
import { getAllLegalMoves } from './LegalMoves.js';

export class Game {
    
    constructor(board) {
        this.board = board;
        this.sideToMove = 'white';
        this.gameOver = false;
        this.UI = new UI(this);

        this.whitePossibleMoves = [];
        this.blackPossibleMoves = [];
        this.whiteLegalMoves = [];
        this.blackLegalMoves = [];
        this.lastMove = null;
        this.movesPlayed = [];
        this.pgn = [];
    }

    start() {
        this.UI.enablePieceMovement();
        this.UI.handlePromotionMenu();
        getAllLegalMoves();
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