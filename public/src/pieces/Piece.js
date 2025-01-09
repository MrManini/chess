import { Move } from '../game/Move.js';
import { Queen, Rook, Bishop, Knight } from './ImportPieces.js';

export class Piece {
    constructor(type, color, square) {
        this.type = type;
        this.color = color;
        this.square = square;
        this.img = `images/${type}-${color}.svg`;
        this.moves = [];
        this.legalMoves = [];
    }

    move(toSquare, capture = false, enPassant = false, promotion = null) {
        const currentSquare = document.getElementById(this.square.id);
        const targetSquareElement = document.getElementById(toSquare.id);
        const pieceImg = currentSquare.firstChild;
        
        const move = new Move(this, this.square, toSquare);
        if (capture) {
            move.setCapture();
        }
        if (enPassant) {
            move.setEnPassant();
        }
        if (this.type === 'king' || this.type === 'rook') {
            this.hasMoved = true;
        }
        if (promotion) {
            move.setPromotion(promotion);
            let newPiece;
            if (promotion === 'queen') {
                newPiece = new Queen(this.color, toSquare);
            } else if (promotion === 'rook') {
                newPiece = new Rook(this.color, toSquare);
            } else if (promotion === 'bishop') {
                newPiece = new Bishop(this.color, toSquare);
            } else if (promotion === 'knight') {
                newPiece = new Knight(this.color, toSquare);
            }
            this.promote(newPiece, toSquare);
        } else {
            currentSquare.removeChild(pieceImg);
            currentSquare.style.backgroundColor = "";
    
            this.square.removePiece();
            this.square = toSquare;
            toSquare.placePiece(this);
        
            targetSquareElement.appendChild(pieceImg);
        }

        sideToMove = (sideToMove === 'white') ? 'black' : 'white';
        deselectPiece();
        movesPlayed.push(move);
        pgn.push(move.toString());
        console.log(pgn);
        lastMove = move;
        getAllLegalMoves();

        const sideToMoveKing = sideToMove === 'white' ? whiteKing : blackKing;
        if (sideToMoveKing.isInCheckmate()) handleCheckmate(sideToMoveKing);
        if (sideToMoveKing.isInStalemate()) handleStalemate();
    }

    capture(piece) {
        piece.die();
        this.move(piece.square, true);
    }

    captureEnPassant(pawn) {
    }

    checkLegalMove(move) {
        const isLegalMove = this.legalMoves.some(legalMove =>
            move.piece === legalMove.piece &&
            move.from.id === legalMove.from.id &&
            move.to.id === legalMove.to.id
        );
        return isLegalMove;
    }

    getPossibleMoves() {
    }
    
    getImg() {
        return this.img;
    }

    die() {
        this.square.removePiece();
        const pieceIndex = this.color === 'white' ? whiteAlivePieces.indexOf(this) : blackAlivePieces.indexOf(this);
        if (this.color === 'white') {
            whiteAlivePieces.splice(pieceIndex, 1);
        } else {
            blackAlivePieces.splice(pieceIndex, 1);
        }
        const squareElement = document.getElementById(this.square.id);
        squareElement.removeChild(squareElement.firstChild);
    }

    render() {
        const pieceImg = document.createElement('img');
        pieceImg.src = this.img;
        pieceImg.classList.add(`${this.color}`, `${this.type}`);
        pieceImg.style.width = '100%';
        pieceImg.style.height = '100%';
        return pieceImg;
    }
}