const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
let squares = {};
let selectedPiece = null;
let sideToMove = "white";
const selectedPieceColor = "#26995c";
let whitePossibleMoves = [];
let blackPossibleMoves = [];
let whiteLegalMoves = [];
let blackLegalMoves = [];
let lastMove = null;
let whiteAlivePieces = [];
let blackAlivePieces = [];
let movesPlayed = [];
let pgn = [];
let possiblePromotionMove = null;
let whitePromotionMenu = document.getElementById('white-promotion');
let blackPromotionMenu = document.getElementById('black-promotion');
let whiteKing = null;
let blackKing = null;
let gameOver = false;
const pieceNotation = {
    pawn: '',
    rook: 'R',
    knight: 'N',
    bishop: 'B',
    queen: 'Q',
    king: 'K'
}

class Piece {
    constructor(type, color, square) {
        this.type = type;
        this.color = color;
        this.square = square;
        this.img = `images/${type}-${color}.svg`;
        this.moves = [];
        this.legalMoves = [];
        this.attackingSquares = [];
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

class Pawn extends Piece {
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
            move.setEnPassant();
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
            move.setEnPassant();
            this.moves.push(move);  
        }
    }
}

class Rook extends Piece {
    constructor(color, square) {
        super('rook', color, square);
        this.hasMoved = false;
    }

    getPossibleMoves() {
        this.moves = [];
        getLinearMoves(this, this.square, [[0, 1], [0, -1], [1, 0], [-1, 0]]);
    }
}

class Knight extends Piece {
    constructor(color, square) {
        super('knight', color, square);
    }

    getPossibleMoves() {
        this.moves = [];
        const [fromFile, fromRank] = getPosition(this.square);
        const knightMoves = [   // All possible knight moves
            [fromFile + 2, fromRank + 1], [fromFile + 2, fromRank - 1],
            [fromFile - 2, fromRank + 1], [fromFile - 2, fromRank - 1],
            [fromFile + 1, fromRank + 2], [fromFile + 1, fromRank - 2],
            [fromFile - 1, fromRank + 2], [fromFile - 1, fromRank - 2]
        ];
        knightMoves.forEach((knightMove) => {
            const [file, rank] = knightMove;  
            if (file >= 0 && file <= 7 && rank >= 1 && rank <= 8) {
                let toSquare = squares[files[file] + rank];
                let move = new Move(this, this.square, toSquare);
                if (toSquare && toSquare.isEmpty()) {
                    this.moves.push(move);
                } else if (toSquare.piece.color !== this.color) {
                    move.setCapture();
                    this.moves.push(move);
                }
            }
        });        
    }
}

class Bishop extends Piece {
    constructor(color, square) {
        super('bishop', color, square);
    }

    getPossibleMoves() {
        this.moves = [];
        getLinearMoves(this, this.square, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
    }
}

class Queen extends Piece {
    constructor(color, square) {
        super('queen', color, square);
    }

    getPossibleMoves() {
        this.moves = [];
        const tempRook = new Rook(this.color, this.square);
        const tempBishop = new Bishop(this.color, this.square);
        tempRook.getPossibleMoves();
        tempRook.moves.forEach(move => {
            const newMove = new Move(this, this.square, move.to);
            if (move.isCapture) {
                newMove.setCapture();
            }
            this.moves.push(newMove);
        });

        tempBishop.getPossibleMoves();
        tempBishop.moves.forEach(move => {
            const newMove = new Move(this, this.square, move.to);
            if (move.isCapture) {
                newMove.setCapture();
            }
            this.moves.push(newMove);
        });
    }
}

class King extends Piece {
    constructor(color, square) {
        super('king', color, square);
        this.hasMoved = false;
    }

    getPossibleMoves() {
        this.moves = [];
        const [fromFile, fromRank] = getPosition(this.square);
        const kingMoves = [     // All possible king moves
            [fromFile + 1, fromRank], [fromFile - 1, fromRank],
            [fromFile, fromRank + 1], [fromFile, fromRank - 1],
            [fromFile + 1, fromRank + 1], [fromFile + 1, fromRank - 1],
            [fromFile - 1, fromRank + 1], [fromFile - 1, fromRank - 1]
        ];
        kingMoves.forEach((kingMove) => {
            const [file, rank] = kingMove;
            if (file >= 0 && file <= 7 && rank >= 1 && rank <= 8) {
                let toSquare = squares[files[file] + rank];
                let move = new Move(this, this.square, toSquare);
                if (toSquare && toSquare.isEmpty()) {
                    // No piece on the target square, add move
                    this.moves.push(move); 
                } else if (toSquare.piece.color !== this.color) {
                    // Piece of the opposite color on the target square, add capture
                    this.moves.push(move);
                    move.setCapture();
                }
            }
        });
    }

    isInCheck(capturedPiece = null) {
        getAllPossibleMoves(capturedPiece);
        const opponentMoves = this.color === 'white' ? blackPossibleMoves : whitePossibleMoves;
        return opponentMoves.some(move => move.to === this.square);
    }

    isInCheckmate() {
        const sideToMoveLegalMoves = sideToMove === 'white' ? whiteLegalMoves : blackLegalMoves;
        return this.isInCheck() && sideToMoveLegalMoves.length === 0;
    }

    isInStalemate() {
        const sideToMoveLegalMoves = sideToMove === 'white' ? whiteLegalMoves : blackLegalMoves;
        return !this.isInCheck() && sideToMoveLegalMoves.length === 0;
    }
}

class Square {
    constructor(file, rank) {
        this.file = file;
        this.rank = rank;
        this.id = file + rank;
        this.piece = null;
    }

    getPiece() {
        return this.piece;
    }

    placePiece(piece) {
        this.piece = piece;
        piece.square = this;
    }

    removePiece() {
        this.piece = null;
    }

    isEmpty() {
        return this.piece === null;
    }

    isOccupiedByEnemy(color) {
        return this.piece && this.piece.color !== color;
    }

    isOccupiedByFriendly(color) {
        return this.piece && this.piece.color === color;
    }
}

class Move {
    constructor(piece, from, to) {
        this.piece = piece;
        this.from = from;
        this.to = to;
        this.isCapture = false;
        this.isCheck = false;
        this.isCheckmate = false;
        this.isEnPassant = false;
        this.enPassantPawn = null;
        this.piecePromoted = null;
        this.disambiguateFile = null;
        this.disambiguateRank = null;
    }

    setCapture() {
        this.isCapture = true;
    }
    
    setCheck() {
        this.isCheck = true;
    }

    setCheckmate() {
        this.isCheckmate = true;
    }

    setEnPassant() {
        this.isEnPassant = true;
        const toSquare = this.to;
        const direction = this.piece.color === 'white' ? 1 : -1;
        const enPassantSquare = squares[toSquare.file + (parseInt(toSquare.rank) - direction)];
        this.enPassantPawn = enPassantSquare.piece;
    }

    setPromotion(piece) {
        this.piecePromoted = piece;
    }

    setDisambiguateFile(file) {
        this.disambiguateFile = file;
    }

    setDisambiguateRank(rank) {
        this.disambiguateRank = rank;
    }

    toString() {
        let move = "";
        let pieceType = this.piece.type;
        if(pieceType === 'king' && this.from.id[0] === 'e' && this.to.id[0] === 'g') {
            move = 'O-O';
        } else if(pieceType === 'king' && this.from.id[0] === 'e' && this.to.id[0] === 'c') {
            move = 'O-O-O';
        } else {
            move = pieceNotation[pieceType];
            if (this.disambiguateFile) {
                move += this.disambiguateFile;
            }
            if (this.disambiguateRank) {
                move += this.disambiguateRank;
            }
            if (this.isCapture && pieceType !== 'pawn') {
                move += 'x';
            } else if (this.isCapture && pieceType === 'pawn') {
                move += this.from.id[0] + 'x';
            }
            if (this.isEnPassant) {
                move += this.enPassantPawn.square.id;
                move += ' e.p.';
            } else {
                move += this.to.id;
            }
            if (this.piecePromoted) {
                move += '=' + pieceNotation[this.piecePromoted];
            }
        }
        if (this.isCheck) {
            move += '+';
        }
        if (this.isCheckmate) {
            move += '#';
        }
        return move;
    }

}

function initializeChessboard() {
    const chessboard = document.getElementById('chessboard');
    
    for (let row = 0; row < 8; row++) {
        for (let column = 0; column < 8; column++) {
            const file = files[column];
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

            squares[id] = new Square(file, rank);
        }
    }
}

function placeStartingPiece(piece, squareId) {
    const pieceSquare = document.getElementById(squareId);
    const pieceImg = piece.render();
    pieceSquare.appendChild(pieceImg);

    if (piece.color === 'white') {
        whiteAlivePieces.push(piece);
    } else {
        blackAlivePieces.push(piece);
    }
}

function setStartingPosition() {
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
            const square = squares[squareId];

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
                    whiteKing = piece;
                } else {
                    blackKing = piece;
                }
            }

            square.placePiece(piece);
            placeStartingPiece(piece, squareId);
        });
    }
}

function enablePieceMovement() {
    // Add click event listener to all squares containing a piece
    document.querySelectorAll('img').forEach(function(pieceImg) {
        pieceImg.addEventListener('click', handlePieceClick);
    });

    // Add a click event listener to all squares
    document.querySelectorAll('.square').forEach(function(squareImg) {
        squareImg.addEventListener('click', handleSquareClick);
    });
}

function handlePieceClick(event) {
    event.stopPropagation();
    
    const pieceImg = event.target;
    const squareId = pieceImg.parentElement.id;
    if (!gameOver && squareId != "white-promotion" && squareId != "black-promotion") {
        const square = squares[squareId];
        const piece = square.getPiece();
        if (piece.color === sideToMove) {
            // Select the piece if it's the correct side's turn
            deselectPiece();
            selectedPiece = piece;
            pieceImg.parentElement.style.backgroundColor = selectedPieceColor;
            console.log(`${piece.color} ${piece.type} selected on ${piece.square.id}`);
            console.log(`Possible moves: ${selectedPiece.moves}`);
            console.log(`Legal moves: ${selectedPiece.legalMoves}`);
        } else if (piece.color !== sideToMove && selectedPiece) {
            // Try to capture an opponent's piece
            let move = new Move(selectedPiece, selectedPiece.square, piece.square);
            move.setCapture();
            let isLegalMove = selectedPiece.checkLegalMove(move);
            
            if (isLegalMove) {
                if (selectedPiece.type === 'pawn' && (square.rank === 8 || square.rank === 1)) {
                    possiblePromotionMove = move;
                    console.log(move);
                    if (square.rank === 8) {
                        whitePromotionMenu.style.visibility = 'visible';
                    } else if (square.rank === 1) {
                        blackPromotionMenu.style.visibility = 'visible';
                    }
                } else {
                    selectedPiece.capture(piece);
                    console.log(`Captured ${piece.type} on ${piece.square.id}`);
                }
            } else {
                // Not a legal move
                deselectPiece();
            }
        }
    }
}

function handleSquareClick(event) {
    event.stopPropagation();
    
    if (selectedPiece) {
        const squareImg = event.target;
        const square = squares[squareImg.id];
        let move = new Move(selectedPiece, selectedPiece.square, square);
        let isLegalMove = false;
        let enPassantMove = null;
        if (selectedPiece.color === 'white') {
            isLegalMove = whiteLegalMoves.some(legalMove =>
                move.piece === legalMove.piece &&
                move.from.id === legalMove.from.id &&
                move.to.id === legalMove.to.id
            ); 
            enPassantMove = whiteLegalMoves.find(legalMove => legalMove.isEnPassant);
        } else {
            isLegalMove = blackLegalMoves.some(legalMove =>
                move.piece === legalMove.piece &&
                move.from.id === legalMove.from.id &&
                move.to.id === legalMove.to.id
            ); 
            enPassantMove = blackLegalMoves.find(legalMove => legalMove.isEnPassant);
        }
        if (enPassantMove &&
            move.piece === enPassantMove.piece &&
            move.from === enPassantMove.from &&
            move.to === enPassantMove.to
        ) {
            selectedPiece.captureEnPassant(enPassantMove.enPassantPawn);
            console.log(`Captured en passant on ${enPassantMove.piece.square.id}`);
        } else if (isLegalMove) {
            // If a piece is selected, then a square is clicked, the piece moves to that square
            if (selectedPiece.type === 'pawn' && (square.rank === 8 || square.rank === 1)) {
                possiblePromotionMove = move;
                if (square.rank === 8) {
                    whitePromotionMenu.style.visibility = 'visible';
                } else if (square.rank === 1) {
                    blackPromotionMenu.style.visibility = 'visible';
                }
            } else {
                selectedPiece.move(square);
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

function handleCheckmate(king) {
    const otherSide = king.color === 'white' ? 'black' : 'white';
    console.log(`Checkmate! ${otherSide} wins!`);
    gameOver = true;
    const kingSquareElement = document.getElementById(king.square.id);
    kingSquareElement.style.backgroundColor = '#a81a0c';
}

function handleStalemate() {
    console.log("Stalemate. It's a draw.");
    gameOver = true;
    whiteKingSquareElement = document.getElementById(whiteKing.square.id);
    blackKingSquareElement = document.getElementById(blackKing.square.id);
    whiteKingSquareElement.style.backgroundColor = '#cdd26b';
    blackKingSquareElement.style.backgroundColor = '#cdd26b';
}

function deselectPiece() {
    if (selectedPiece) {
        const selectedSquare = document.getElementById(selectedPiece.square.id);
        selectedSquare.style.backgroundColor = "";
        selectedPiece = null;
        whitePromotionMenu.style.visibility = 'hidden';
        blackPromotionMenu.style.visibility = 'hidden';
    }
}

function handlePromotionMenu() {
    document.querySelectorAll('.promotion-piece').forEach(piece => {
        piece.addEventListener('click', () => {
            const promotionType = piece.id;
            let pawn = possiblePromotionMove.piece;
            let square = possiblePromotionMove.to;
            let capture = possiblePromotionMove.isCapture;
            pawn.move(square, capture, false, promotionType);
            
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

function getPosition(square) {
    const id = square.id;
    const file = files.indexOf(id[0]);
    const rank = parseInt(id[1]);
    return [file, rank];
}

function getAllPossibleMoves(capturedPiece) {
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

function getAllLegalMoves() {
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

function getLinearMoves(piece, fromSquare, directions) {
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

initializeChessboard();
setStartingPosition();
enablePieceMovement();
handlePromotionMenu();
getAllLegalMoves();