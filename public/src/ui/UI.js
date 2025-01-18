import { Move } from '../game/Move.js';

export class UI {

    static whitePromotionMenu = document.getElementById('white-promotion');
    static blackPromotionMenu = document.getElementById('black-promotion');

    constructor(game) {
        this.game = game;
        this.selectedPiece = null;
        this.selectedPieceColor = '#26995c';
        this.possiblePromotionMove = null;
    }

    enablePieceMovement() {
        // Add click event listener to all squares containing a piece
        document.querySelectorAll('img').forEach((pieceImg) => {
            pieceImg.addEventListener('click', this.handlePieceClick);
        });
    
        // Add a click event listener to all squares
        document.querySelectorAll('.square').forEach((squareImg) => {
            squareImg.addEventListener('click', this.handleSquareClick);
        });
    }

    handlePieceClick(event) {
        event.stopPropagation();
        const {gameOver, sideToMove} = this.game;
        const squares = this.game.board.squares;
        const pieceImg = event.target;
        const squareId = pieceImg.parentElement.id;
        if (!gameOver && squareId != "white-promotion" && squareId != "black-promotion") {
            const square = squares[squareId];
            const piece = square.getPiece();
            if (piece.color === sideToMove) {
                // Select the piece if it's the correct side's turn
                deselectPiece();
                this.selectedPiece = piece;
                pieceImg.parentElement.style.backgroundColor = this.selectedPieceColor;
                console.log(`${piece.color} ${piece.type} selected on ${piece.square.id}`);
                console.log(`Possible moves: ${this.selectedPiece.moves}`);
                console.log(`Legal moves: ${this.selectedPiece.legalMoves}`);
            } else if (piece.color !== sideToMove && this.selectedPiece) {
                // Try to capture an opponent's piece
                let move = new Move(this.selectedPiece, this.selectedPiece.square, piece.square);
                move.setCapture();
                let isLegalMove = this.selectedPiece.checkLegalMove(move);
                
                if (isLegalMove) {
                    if (this.selectedPiece.type === 'pawn' && (square.rank === 8 || square.rank === 1)) {
                        this.possiblePromotionMove = move;
                        console.log(move);
                        if (square.rank === 8) {
                            whitePromotionMenu.style.visibility = 'visible';
                        } else if (square.rank === 1) {
                            blackPromotionMenu.style.visibility = 'visible';
                        }
                    } else {
                        this.selectedPiece.capture(piece);
                        console.log(`Captured ${piece.type} on ${piece.square.id}`);
                    }
                } else {
                    // Not a legal move
                    deselectPiece();
                }
            }
        }
    }

    handleSquareClick(event) {
        event.stopPropagation();
        
        if (this.selectedPiece) {
            const squareImg = event.target;
            const squares = this.game.board.squares;
            const square = squares[squareImg.id];
            let move = new Move(this.selectedPiece, this.selectedPiece.square, square);
            let enPassantMove = null;
            let isLegalMove = this.selectedPiece.checkLegalMove(move);
            enPassantMove = this.selectedPiece.find(legalMove => legalMove.isEnPassant);
            if (enPassantMove && enPassantMove.isEqualTo(move)) {
                this.selectedPiece.captureEnPassant(enPassantMove.enPassantPawn);
                console.log(`Captured en passant on ${enPassantMove.piece.square.id}`);
            } else if (isLegalMove) {
                // If a piece is selected, then a square is clicked, the piece moves to that square
                if (this.selectedPiece.type === 'pawn' && (square.rank === 8 || square.rank === 1)) {
                    this.possiblePromotionMove = move;
                    if (square.rank === 8) {
                        whitePromotionMenu.style.visibility = 'visible';
                    } else if (square.rank === 1) {
                        blackPromotionMenu.style.visibility = 'visible';
                    }
                } else {
                    this.selectedPiece.move(square);
                }
            } else {
                // If a piece is selected, then a square is clicked, but it's not a legal move
                console.log("Illegal move");
                deselectPiece();
            }
        } else {
            console.log("No selected piece");
        }
    }

    deselectPiece() {
        if (this.selectedPiece) {
            const selectedSquare = document.getElementById(this.selectedPiece.square.id);
            selectedSquare.style.backgroundColor = "";
            this.selectedPiece = null;
            whitePromotionMenu.style.visibility = 'hidden';
            blackPromotionMenu.style.visibility = 'hidden';
        }
    }

    handlePromotionMenu() {
        document.querySelectorAll('.promotion-piece').forEach(piece => {
            piece.addEventListener('click', () => {
                const promotionType = piece.id;
                let pawn = possiblePromotionMove.piece;
                let square = possiblePromotionMove.to;
                let capture = possiblePromotionMove.isCapture;
                pawn.move(square, capture, promotionType);
                
                whitePromotionMenu.style.visibility = 'hidden';
                blackPromotionMenu.style.visibility = 'hidden';
                console.log(`promoted to ${promotionType}`);
            });
        });
    
        document.addEventListener('click', (event) => {
            event.stopPropagation();
            if (whitePromotionMenu.style.visibility === 'visible' && !whitePromotionMenu.contains(event.target)) {
                whitePromotionMenu.style.visibility = 'hidden';
                deselectPiece();
            } else if (blackPromotionMenu.style.visibility === 'visible' && !blackPromotionMenu.contains(event.target)) {
                blackPromotionMenu.style.visibility = 'hidden';
                deselectPiece();
            }
        });
    }
}

