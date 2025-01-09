import { Square } from './Square.js';
import { Pawn, Rook, Knight, Bishop, Queen, King } from '../pieces/ImportPieces.js';

export class Board {

    constructor() {
        this.squares = {};
        this.files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        this.whiteAlivePieces = [];
        this.blackAlivePieces = [];
        this.whiteKing = null;
        this.blackKing = null;
        this.initializeChessboard();
        this.setStartingPosition();
    }

    initializeChessboard() {
        const chessboard = document.getElementById('chessboard');
        
        for (let row = 0; row < 8; row++) {
            for (let column = 0; column < 8; column++) {
                const file = this.files[column];
                const rank = 8 - row;
                const id = file + rank;
                const square = document.createElement('div');
                square.classList.add('square');
                
                if ((row + column) % 2 == 0) {
                    square.classList.add('light');
                } else {
                    square.classList.add('dark');
                }
    
                square.id = id;
                chessboard.appendChild(square);
    
                this.squares[id] = new Square(file, rank);
            }
        }
    }

    placeStartingPiece(piece, squareId) {
        const pieceSquare = document.getElementById(squareId);
        const pieceImg = piece.render();
        pieceSquare.appendChild(pieceImg);
    
        if (piece.color === 'white') {
            this.whiteAlivePieces.push(piece);
        } else {
            this.blackAlivePieces.push(piece);
        }
    }
    
    setStartingPosition() {
        const startingSquares = {
            pawn: ['a2', 'a7', 'b2', 'b7', 'c2', 'c7', 'd2', 'd7', 'e2', 'e7', 'f2', 'f7', 'g2', 'g7', 'h2', 'h7'],
            rook: ['a1', 'a8', 'h1', 'h8'],
            knight: ['b1', 'b8', 'g1', 'g8'],
            bishop: ['c1', 'f1', 'c8', 'f8'],
            queen: ['d1', 'd8'],
            king: ['e1', 'e8']
        };
    
        for (let type in startingSquares) {
            startingSquares[type].forEach(squareId => {
                const color = squareId[1] === '1' || squareId[1] === '2' ? 'white' : 'black';
                const square = this.squares[squareId];
    
                let piece;
                if (type === 'pawn') {
                    piece = new Pawn(color, square);
                } else if (type === 'rook') {
                    piece = new Rook(color, square);
                } else if (type === 'knight') {
                    piece = new Knight(color, square);
                } else if (type === 'bishop') {
                    piece = new Bishop(color, square);
                } else if (type === 'queen') {
                    piece = new Queen(color, square);
                } else if (type === 'king') {
                    piece = new King(color, square);
                    if (color === 'white') {
                        this.whiteKing = piece;
                    } else {
                        this.blackKing = piece;
                    }
                }
    
                square.placePiece(piece);
                placeStartingPiece(piece, squareId);
            });
        }
    }

    getPosition(square) {
        const id = square.id;
        const file = this.files.indexOf(id[0]);
        const rank = parseInt(id[1]);
        return [file, rank];
    }
}