import { Move } from './Move.js';
import Board from '../board/Board.js';

let board;
let whiteLegalMoves = [];
let blackLegalMoves = [];
let whitePossibleMoves = [];
let blackPossibleMoves = [];

function getBoardAttributes() {
    board = Board.getInstance();
    const { whiteAlivePieces, blackAlivePieces, whiteKing, blackKing, squares, files} = board;
    return { whiteAlivePieces, blackAlivePieces, whiteKing, blackKing, squares, files };
}

export function computePossibleMoves(capturedPiece, lastMove) {
    const { whiteAlivePieces, blackAlivePieces } = getBoardAttributes();
    let whiteMoves = [];
    whiteAlivePieces.forEach(function(piece) {
        if (piece !== capturedPiece) {
            piece.getPossibleMoves(lastMove);
            piece.moves.forEach(move => {
                whiteMoves.push(move);
            });
        }
    });
    let blackMoves = [];
    blackAlivePieces.forEach(function(piece) {
        if (piece !== capturedPiece) {
            piece.getPossibleMoves(lastMove);
            piece.moves.forEach(move => {
                blackMoves.push(move);
            });
        }
    });

    return { whiteMoves, blackMoves };
}

export function updatePossibleMoves(capturedPiece, lastMove) {
    const { whiteMoves, blackMoves } = computePossibleMoves(capturedPiece, lastMove);
    whitePossibleMoves = whiteMoves;
    blackPossibleMoves = blackMoves;
}

export function getAllPossibleMoves(){
    return { whitePossibleMoves, blackPossibleMoves };
}

export function computeLegalMoves(lastMove) {
    const { whiteAlivePieces, blackAlivePieces, whiteKing, blackKing } = getBoardAttributes();
    let whiteMoves = [];
    whiteAlivePieces.forEach(function(piece) {
        piece.getPossibleMoves(lastMove);
        disallowIllegalMoves(piece, whiteKing, blackKing, lastMove, whiteMoves);
    });
    let blackMoves = [];
    blackAlivePieces.forEach(function(piece) {
        piece.getPossibleMoves(lastMove);
        disallowIllegalMoves(piece, whiteKing, blackKing, lastMove, blackMoves);
    });
    return { whiteMoves, blackMoves };
}

export function updateLegalMoves(lastMove){
    const { whiteMoves, blackMoves } = computeLegalMoves(lastMove);
    whiteLegalMoves = whiteMoves;
    blackLegalMoves = blackMoves;
}

export function getAllLegalMoves(){
    return { whiteLegalMoves, blackLegalMoves };
}

function isLegalLinearMove(piece, toFile, toRank) {
    const { files, squares } = getBoardAttributes();
    const square = squares[files[toFile] + toRank];
    let move = new Move(piece, piece.square, square);
    if (square.isEmpty()) {
        // No piece on the target square, add move and keep searching
        piece.moves.push(move);
        return true;
    } else if (square.piece.color !== piece.color) {
        // Piece of the opposite color on the target square, add move and stop searching
        move.setCapture();
        piece.moves.push(move);
        return false;
    }
    // Piece of the same color on the target square, stop searching
    return false;
}

export function getLinearMoves(piece, fromSquare, directions) {
    const { squares } = getBoardAttributes();
    const [fromFile, fromRank] = fromSquare.getPosition();
    directions.forEach(direction => {
        let file = fromFile + direction[0];
        let rank = fromRank + direction[1];
        while (file >= 0 && file <= 7 && rank >= 1 && rank <= 8) {
            let keepSearching = isLegalLinearMove(piece, file, rank);
            if (!keepSearching) break;
            file += direction[0];
            rank += direction[1];
        }
    });
}

function disallowIllegalMoves(piece, whiteKing, blackKing, lastMove, moves) {
    const originalSquare = piece.square;
    const validMoves = [];

    piece.moves.forEach(move => {
        // Obtain original check state
        const king = piece.color === 'white' ? whiteKing : blackKing;
        const originalCheckState = king.isInCheck;
        let isKingInCheck;

        // Simulate the move
        const targetSquare = move.to;
        let capturedPiece;
        let enPassantCaptureSquare;
        if (move.isEnPassant) {
            const direction = piece.color === 'white' ? 1 : -1;
            enPassantCaptureSquare = board.squares[targetSquare.file + (parseInt(targetSquare.rank) - direction)];
            capturedPiece = enPassantCaptureSquare.getPiece();
        } else {
            capturedPiece = targetSquare.getPiece();
        }
        
        if (!move.castleType){
            piece.square.removePiece();
            if (capturedPiece) capturedPiece.square.removePiece();
            targetSquare.placePiece(piece);

            // Check if the king is in check
            king.computeCheck(capturedPiece, lastMove);
            isKingInCheck = king.isInCheck;

            // Revert the move
            targetSquare.removePiece();
            originalSquare.placePiece(piece);
            king.isInCheck = originalCheckState;
            if (capturedPiece && enPassantCaptureSquare) {
                enPassantCaptureSquare.placePiece(capturedPiece);
            } else if (capturedPiece) {
                targetSquare.placePiece(capturedPiece);
            }
        } else {
            let checkSquares;
            if (move.castleType === 'kingside') {
                checkSquares = ['f' + targetSquare.rank, 'g' + targetSquare.rank];
            } else {
                checkSquares = ['c' + targetSquare.rank, 'd' + targetSquare.rank];
            }

            isKingInCheck = checkSquares.some(square => {
                piece.square.removePiece();
                targetSquare.placePiece(piece);
            
                // Check if the king is in check
                king.computeCheck(null, lastMove);
                const inCheck = king.isInCheck;
            
                // Revert the move
                square.removePiece();
                originalSquare.placePiece(piece);
                king.isInCheck = originalCheckState;
            
                return inCheck; // If at least one square results in check, returns true
            });
        }

        // If the king is not in check, add the move to valid moves
        if (!isKingInCheck) validMoves.push(move);
    });

    piece.legalMoves = validMoves;

    validMoves.forEach(move => {
        moves.push(move);
    });
}