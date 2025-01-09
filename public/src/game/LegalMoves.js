export function getAllPossibleMoves(capturedPiece) {
    whitePossibleMoves = [];
    blackPossibleMoves = [];
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
}

export function getAllLegalMoves() {
    whiteLegalMoves = [];
    blackLegalMoves = [];
    whiteAlivePieces.forEach(function(piece) {
        piece.getPossibleMoves();
        disallowIllegalMoves(piece);
    });
    blackAlivePieces.forEach(function(piece) {
        piece.getPossibleMoves();
        disallowIllegalMoves(piece);
    });
}

function isLegalLinearMove(piece, toFile, toRank) {
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
    const [fromFile, fromRank] = getPosition(fromSquare);
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

function disallowIllegalMoves(piece) {
    const originalSquare = piece.square;
    const validMoves = [];

    let counter = 0;

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
        if (capturedPiece) {
            targetSquare.placePiece(capturedPiece);
        }

        // If the king is not in check, add the move to valid moves
        if (!isKingInCheck) {
            validMoves.push(move);
        } else {
            counter++;
        }

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