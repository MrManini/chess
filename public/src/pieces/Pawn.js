import { Piece } from './Piece.js';
import { Move } from '../game/Move.js';


export class Pawn extends Piece {
    constructor(color, square) {
        super('pawn', color, square);
    }

    captureEnPassant(pawn) {
        const direction = this.color === 'white' ? 1 : -1;
        const toSquare = squares[pawn.square.file + (parseInt(pawn.square.rank) + direction)];
        this.move(toSquare, true, true);
        pawn.die();
    }

    promote(piece, square) {
        if (this.color === 'white') {
            whiteAlivePieces.push(piece);
        } else {
            blackAlivePieces.push(piece);
        }
        this.die();
        const squareElement = document.getElementById(square.id);
        if (squareElement.firstChild) squareElement.removeChild(squareElement.firstChild);
        const newPieceElement = piece.render();
        squareElement.appendChild(newPieceElement);
        // Reattach event listener to the new piece's image element
        newPieceElement.addEventListener('click', handlePieceClick);
        square.placePiece(piece);
    }

    getPossibleMoves() {
        const [fromFile, fromRank] = [files.indexOf(this.square.file), this.square.rank];
        this.moves = [];
        const direction = this.color === 'white' ? 1 : -1; // White moves "up", black "down"
        let toSquare = squares[files[fromFile] + (parseInt(fromRank) + direction)];
        // One square forward
        if ( 
            toSquare &&          // Square in front of the pawn is not null
            toSquare.isEmpty()   // No piece on the target square
        ) {
            let move = new Move(this, this.square, toSquare); // Pawn moves one square forward
            if (toSquare.rank === 1 || toSquare.rank === 8) {
                move.setPromotion('queen');
                this.moves.push(move);
                move = new Move(this, this.square, toSquare);
                move.setPromotion('rook');
                this.moves.push(move);
                move = new Move(this, this.square, toSquare);
                move.setPromotion('bishop');
                this.moves.push(move);
                move = new Move(this, this.square, toSquare);
                move.setPromotion('knight');
                this.moves.push(move);
            } else {
                this.moves.push(move);
            }
        }
        toSquare = squares[files[fromFile] + (parseInt(fromRank) + 2 * direction)];
        const intermediateSquare = squares[files[fromFile] + (parseInt(fromRank) + direction)];
        // Two squares forward
        if (
            toSquare &&                                       // Square two squares in front of the pawn is not null
            fromRank === (this.color === 'white' ? 2 : 7) &&  // Pawn is on the second (white) or seventh (black) rank
            toSquare.isEmpty() &&                             // No piece on the target square
            intermediateSquare.isEmpty()                      // No piece on the square directly in front of the pawn
        ) {
            let move = new Move(this, this.square, toSquare);  // Pawn moves two squares forward    
            this.moves.push(move);
        }
        toSquare = squares[files[fromFile - direction] + (parseInt(fromRank) + direction)];
        // One file to the left, one square forward
        if (
            toSquare &&                                   // Square to the left is not null
            toSquare.isOccupiedByEnemy(this.color)        // Enemy piece on the target square
        ) {
            let move = new Move(this, this.square, toSquare);  // Pawn captures to the left
            move.setCapture();
            if (toSquare.rank === 1 || toSquare.rank === 8) {
                move.setPromotion('queen');
                this.moves.push(move);
                move = new Move(this, this.square, toSquare);
                move.setPromotion('rook');
                move.setCapture();
                this.moves.push(move);
                move = new Move(this, this.square, toSquare);
                move.setPromotion('bishop');
                move.setCapture();
                this.moves.push(move);
                move = new Move(this, this.square, toSquare);
                move.setPromotion('knight');
                move.setCapture();
                this.moves.push(move);
            } else {
                this.moves.push(move);
            }     
        }
        if (
            lastMove &&                                                 // There was a last move
            lastMove.piece.type === 'pawn' &&                           // The last move was a pawn move
            Math.abs(lastMove.from.rank - lastMove.to.rank) === 2 &&    // The pawn moved two squares forward
            toSquare &&                                                 // Square to the left is not null
            toSquare.isEmpty() &&                                       // No piece on the target square
            lastMove.to.file === files[fromFile - direction] &&         // The pawn moved to the square to the left of the current pawn
            lastMove.to.rank === fromRank                               // The pawn moved to the same rank as the current pawn
        ) {
            let move = new Move(this, this.square, toSquare);   // Pawn captures en passant to the left
            move.setCapture();
            this.moves.push(move);
        }
        toSquare = squares[files[fromFile + direction] + (parseInt(fromRank) + direction)];
        // One file to the right, one square forward
        if (
            toSquare &&                                    // Square to the right is not null
            toSquare.isOccupiedByEnemy(this.color)         // Enemy piece on the target square
        ) {
            let move = new Move(this, this.square, toSquare);   // Pawn captures to the right
            move.setCapture();
            if (toSquare.rank === 1 || toSquare.rank === 8) {
                move.setPromotion('queen');
                this.moves.push(move);
                move = new Move(this, this.square, toSquare);
                move.setPromotion('rook');
                move.setCapture();
                this.moves.push(move);
                move = new Move(this, this.square, toSquare);
                move.setPromotion('bishop');
                move.setCapture();
                this.moves.push(move);
                move = new Move(this, this.square, toSquare);
                move.setPromotion('knight');
                move.setCapture();
                this.moves.push(move);
            } else {
                this.moves.push(move);
            }
        }
        if (
            lastMove &&                                                 // There was a last move
            lastMove.piece.type === 'pawn' &&                           // The last move was a pawn move
            Math.abs(lastMove.from.rank - lastMove.to.rank) === 2 &&    // The pawn moved two squares forward
            toSquare &&                                                 // Square to the right is not null
            toSquare.isEmpty() &&                                       // No piece on the target square
            lastMove.to.file === files[fromFile + direction] &&         // The pawn moved to the square to the right of the current pawn
            lastMove.to.rank === fromRank                               // The pawn moved to the same rank as the current pawn
        ) {
            let move = new Move(this, this.square, toSquare);   // Pawn captures en passant to the right
            move.setCapture();
            this.moves.push(move);  
        }
    }
}