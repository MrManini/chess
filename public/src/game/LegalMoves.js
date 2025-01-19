import { Move } from './Move.js';
import Board from '../board/Board.js';

let board;

function getBoardAttributes() {
    board = Board.getInstance();
    const { whiteAlivePieces, blackAlivePieces, whiteKing, blackKing, squares, files} = board;
    return { whiteAlivePieces, blackAlivePieces, whiteKing, blackKing, squares, files };
}

export function getAllPossibleMoves(capturedPiece) {
    const whitePossibleMoves = [];
    const blackPossibleMoves = [];

    const { whiteAlivePieces, blackAlivePieces } = getBoardAttributes();

    whiteAlivePieces.forEach(function(piece) {
        if (piece !== capturedPiece) {
            piece.getPossibleMoves();
            piece.moves.forEach(move => {
                whitePossibleMoves.push(move);
            });
        }
    });
    blackAlivePieces.forEach(function(piece) {
        if (piece !== capturedPiece) {
            piece.getPossibleMoves();
            piece.moves.forEach(move => {
                blackPossibleMoves.push(move);
            });
        }
    });

    return { whitePossibleMoves, blackPossibleMoves };
}

export function getAllLegalMoves(lastMove) {
    const whiteLegalMoves = [];
    const blackLegalMoves = [];

    const { whiteAlivePieces, blackAlivePieces, whiteKing, blackKing } = getBoardAttributes();

    whiteAlivePieces.forEach(function(piece) {
        piece.getPossibleMoves(lastMove);
        disallowIllegalMoves(piece, whiteKing, blackKing, whiteLegalMoves, blackLegalMoves);
    });
    blackAlivePieces.forEach(function(piece) {
        piece.getPossibleMoves(lastMove);
        disallowIllegalMoves(piece, whiteKing, blackKing, whiteLegalMoves, blackLegalMoves);
    });

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

function disallowIllegalMoves(piece, whiteKing, blackKing, whiteLegalMoves, blackLegalMoves) {
    const originalSquare = piece.square;
    const validMoves = [];

    piece.moves.forEach(move => {
        // Simulate the move
        const targetSquare = move.to;
        const capturedPiece = targetSquare.getPiece();
        piece.square.removePiece();
        if (capturedPiece) capturedPiece.square.removePiece();
        targetSquare.placePiece(piece);

        // Check if the king is in check
        const king = piece.color === 'white' ? whiteKing : blackKing;
        const isKingInCheck = king.isInCheck(capturedPiece);

        // Revert the move
        targetSquare.removePiece();
        originalSquare.placePiece(piece);
        if (capturedPiece) targetSquare.placePiece(capturedPiece);

        // If the king is not in check, add the move to valid moves
        if (!isKingInCheck) validMoves.push(move);
    });

    piece.legalMoves = validMoves;

    validMoves.forEach(move => {
        if (piece.color === 'white') {
            whiteLegalMoves.push(move);
        } else {
            blackLegalMoves.push(move);
        }
    });
}