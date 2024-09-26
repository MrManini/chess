const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
let squares = {};
let selectedPiece = null;
let sideToMove = "white";
const selectedPieceColor = "#26995c";
let whiteLegalMoves = [];
let blackLegalMoves = [];
let lastMove = null;
let whiteAlivePieces = [];
let blackAlivePieces = [];
let whiteKingPosition = 'e1';
let blackKingPosition = 'e8';
let movesPlayed = [];
let pgn = [];
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
        this.legalMoves = [];
        this.attackingSquares = [];
    }

    move(toSquare) {
        const currentSquare = document.getElementById(this.square.id);
        const targetSquareElement = document.getElementById(toSquare.id);
        const pieceImg = currentSquare.firstChild;
    
        currentSquare.removeChild(pieceImg);
        currentSquare.style.backgroundColor = "";
        
        this.square.removePiece();
        this.square = toSquare;
        toSquare.placePiece(this);
    
        targetSquareElement.appendChild(pieceImg);
        sideToMove = (sideToMove === 'white') ? 'black' : 'white';
        
        selectedPiece = null;
        movesPlayed.push(move);
        pgn.push(move.toString());
        getAllLegalMoves();
    }

    capture(piece) {
        piece.die();
        this.move(piece.square);
    }

    checkLegalMove(move){
        const isLegalMove = this.legalMoves.some(legalMove =>
            move.piece === legalMove.piece &&
            move.from.id === legalMove.from.id &&
            move.to.id === legalMove.to.id
        );
        return isLegalMove;
    }

    getLegalMoves() {
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
    constructor(color, square){
        super('pawn', color, square);
    }

    getLegalMoves(){ // TODO en passant and promotion
        const [fromFile, fromRank] = [files.indexOf(this.square.file), this.square.rank];
        this.legalMoves = [];
        const direction = this.color === 'white' ? 1 : -1; // White moves "up", black "down"
        let toSquare = squares[files[fromFile] + (parseInt(fromRank) + direction)];
        // One square forward
        if ( 
            toSquare.isEmpty() &&   // No piece on the target square
            !blundersCheck()        // Doesn't put the king in check
        ){
            let move = new Move(this, this.square, toSquare); // Pawn moves one square forward
            this.legalMoves.push(move);
            if (this.color === 'white'){
                whiteLegalMoves.push(move);
            } else {
                blackLegalMoves.push(move);
            }
        }
        toSquare = squares[files[fromFile] + (parseInt(fromRank) + 2 * direction)];
        // Two squares forward
        if (
            fromRank === (this.color === 'white' ? 2 : 7) &&  // Pawn is on the second (white) or seventh (black) rank
            toSquare.isEmpty() &&   // No piece on the target square
            !blundersCheck()        // Doesn't put the king in check
        ){
            let move = new Move(this, this.square, toSquare);  // Pawn moves two squares forward    
            this.legalMoves.push(move);
            if (this.color === 'white'){
                whiteLegalMoves.push(move);
            } else {
                blackLegalMoves.push(move);
            }
        }
        toSquare = squares[files[fromFile - direction] + (parseInt(fromRank) + direction)];
        // One file to the left, one square forward
        if (
            toSquare &&                         // Square to the left is not null
            toSquare.isOccupiedByEnemy() &&     // Enemy piece on the target square
            !blundersCheck()                    // Doesn't put the king in check
        ){
            let move = new Move(this, this.square, toSquare);  // Pawn captures to the left
            move.setCapture();
            this.legalMoves.push(move);
            if (this.color === 'white'){
                whiteLegalMoves.push(move);
            } else {
                blackLegalMoves.push(move);
            }         
        }
        toSquare = squares[files[fromFile + direction] + (parseInt(fromRank) + direction)];
        // One file to the right, one square forward
        if (
            toSquare &&                         // Square to the right is not null
            toSquare.isOccupiedByEnemy() &&     // Enemy piece on the target square
            !blundersCheck()                    // Doesn't put the king in check
        ){
            let move = new Move(this, this.square, toSquare);   // Pawn captures to the right
            move.setCapture();
            this.legalMoves.push(move);
            if (this.color === 'white'){
                whiteLegalMoves.push(move);
            } else {
                blackLegalMoves.push(move);
            }     
        }

    }

}

class Rook extends Piece {
    constructor(color, square){
        super('rook', color, square);
    }

    getLegalMoves(){
        this.legalMoves = [];
        getLinearMoves(this, this.square, [[0, 1], [0, -1], [1, 0], [-1, 0]]);
    }
}

class Knight extends Piece {
    constructor(color, square){
        super('knight', color, square);
    }

    getLegalMoves(){
        this.legalMoves = [];
        const [fromFile, fromRank] = getPosition(this.square);
        const knightMoves = [   // All possible knight moves
            [fromFile + 2, fromRank + 1], [fromFile + 2, fromRank - 1],
            [fromFile - 2, fromRank + 1], [fromFile - 2, fromRank - 1],
            [fromFile + 1, fromRank + 2], [fromFile + 1, fromRank - 2],
            [fromFile - 1, fromRank + 2], [fromFile - 1, fromRank - 2]
        ];
        knightMoves.forEach((knightMove) => {
            const [file, rank] = knightMove;  
            if (file >= 0 && file <= 7 && rank >= 1 && rank <= 8){
                let toSquare = squares[files[file] + rank];
                let move = new Move(this, this.square, toSquare);
                if (toSquare && toSquare.isEmpty()){
                    this.legalMoves.push(move);
                    if (this.color === 'white'){
                        whiteLegalMoves.push(move);
                    } else {
                        blackLegalMoves.push(move);
                    }  
                } else if (toSquare.piece.color !== this.color){
                    move.setCapture();
                    this.legalMoves.push(move);
                    if (this.color === 'white'){
                        whiteLegalMoves.push(move);
                    } else {
                        blackLegalMoves.push(move);
                    }  
                }
            }
        });        
    }
}

class Bishop extends Piece {
    constructor(color, square){
        super('bishop', color, square);
    }

    getLegalMoves(){
        this.legalMoves = [];
        getLinearMoves(this, this.square, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
    }
}

class Queen extends Piece {
    constructor(color, square){
        super('queen', color, square);
    }

    getLegalMoves(){
        this.legalMoves = [];
        const tempRook = new Rook(this.color, this.square);
        const tempBishop = new Bishop(this.color, this.square);
        tempRook.getLegalMoves.call(this);
        tempBishop.getLegalMoves.call(this);
    }
}

class King extends Piece {
    constructor(color, square){
        super('king', color, square);
    }

    getLegalMoves(){
        this.legalMoves = [];
        const [fromFile, fromRank] = getPosition(this.square);
        const kingMoves = [     // All possible king moves
            [fromFile + 1, fromRank], [fromFile - 1, fromRank],
            [fromFile, fromRank + 1], [fromFile, fromRank - 1],
            [fromFile + 1, fromRank + 1], [fromFile + 1, fromRank - 1],
            [fromFile - 1, fromRank + 1], [fromFile - 1, fromRank - 1]
        ];
        kingMoves.forEach((kingMove) => {
            const [file, rank] = kingMove;
            if (file >= 0 && file <= 7 && rank >= 1 && rank <= 8){
                let toSquare = squares[files[file] + rank];
                let move = new Move(this, this.square, toSquare);
                if (toSquare && toSquare.isEmpty()){
                    // No piece on the target square, add move
                    this.legalMoves.push(move);
                    if (this.color === 'white'){
                        whiteLegalMoves.push(move);
                    } else {
                        blackLegalMoves.push(move);
                    }  
                } else if (toSquare.piece.color !== this.color){
                    // Piece of the opposite color on the target square, add capture
                    move.setCapture();
                    if (this.color === 'white'){
                        whiteLegalMoves.push(move);
                    } else {
                        blackLegalMoves.push(move);
                    }  
                }
            }
        });
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
    constructor(piece, from, to){
        this.piece = piece;
        this.from = from;
        this.to = to;
        this.isCapture = false;
        this.isCheck = false;
        this.isCheckmate = false;
        this.isEnPassant = false;
        this.piecePromoted = null;
        this.disambiguateFile = null;
        this.disambiguateRank = null;
    }

    setCapture(){
        this.isCapture = true;
    }
    
    setCheck(){
        this.isCheck = true;
    }

    setCheckmate(){
        this.isCheckmate = true;
    }

    setEnPassant(){
        this.isEnPassant = true;
    }

    setPromotion(piece){
        this.piecePromoted = piece;
    }

    setDisambiguateFile(file){
        this.disambiguateFile = file;
    }

    setDisambiguateRank(rank){
        this.disambiguateRank = rank;
    }

    toString(){
        let move = "";
        let pieceType = this.piece.type;
        if(pieceType === 'king' && this.from.id[0] === 'e' && this.to.id[0] === 'g'){
            move = 'O-O';
        } else if(pieceType === 'king' && this.from.id[0] === 'e' && this.to.id[0] === 'c'){
            move = 'O-O-O';
        } else {
            move = pieceNotation[pieceType];
            if (this.disambiguateFile){
                move += this.disambiguateFile;
            }
            if (this.disambiguateRank){
                move += this.disambiguateRank;
            }
            if (this.isCapture && pieceType !== 'pawn'){
                move += 'x';
            } else if (this.isCapture && pieceType === 'pawn'){
                move += this.from.id[0] + 'x';
            }
            move += this.to.id;
            if (this.isEnPassant){
                move += ' e.p.';
            }
            if (this.piecePromoted){
                move += '=' + pieceNotation[this.piecePromoted];
            }
        }
        if (this.isCheck){
            move += '+';
        }
        if (this.isCheckmate){
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
            }

            square.placePiece(piece);
            placeStartingPiece(piece, squareId);
        });
    }   
}

function enablePieceMovement() {
    // Add click event listener to all squares containing a piece
    document.querySelectorAll('img').forEach(function(pieceImg) {
        pieceImg.addEventListener('click', function(event) {
            event.stopPropagation();

            // Retrieve the square and piece object
            const squareId = pieceImg.parentElement.id;
            const square = squares[squareId];
            const piece = square.getPiece();
            if (piece.color === sideToMove) {
                // Select the piece if it's the correct side's turn
                deselectPiece();
                selectedPiece = piece;
                pieceImg.parentElement.style.backgroundColor = selectedPieceColor;
                console.log(`${piece.color} ${piece.type} selected on ${piece.square.id}`);
                console.log(`Legal moves: ${selectedPiece.legalMoves}`);
            } else if (piece.color !== sideToMove && selectedPiece) {
                // Try to capture an opponent's piece
                let move = new Move(selectedPiece, selectedPiece.square, piece.square);
                move.setCapture();
                let isLegalMove = selectedPiece.checkLegalMove(move);
                
                if (isLegalMove) {
                    selectedPiece.capture(piece);
                    console.log(`Captured ${piece.type} on ${piece.square.id}`);
                    getAllLegalMoves();
                } else {
                    // Not a legal move
                    deselectPiece();
                }
            }
        });
    });

    // Add a click event listener to all squares
    document.querySelectorAll('.square').forEach(function(squareImg) {
        squareImg.addEventListener('click', function() {
            if (selectedPiece) {
                const square = squares[squareImg.id];
                let move = new Move(selectedPiece, selectedPiece.square, square);
                let isLegalMove = false;
                if (selectedPiece.color === 'white'){
                    isLegalMove = whiteLegalMoves.some(legalMove =>
                        move.piece === legalMove.piece &&
                        move.from.id === legalMove.from.id &&
                        move.to.id === legalMove.to.id
                    ); 
                } else {
                    isLegalMove = blackLegalMoves.some(legalMove =>
                        move.piece === legalMove.piece &&
                        move.from.id === legalMove.from.id &&
                        move.to.id === legalMove.to.id
                    ); 
                }             
                if (isLegalMove){
                    // If a piece is selected, then a square is clicked, the piece moves to that square
                    selectedPiece.move(square);
                    console.log(`moved to ${square.id}`);
                    console.log(`${sideToMove} to move`);
                    if (selectedPiece.type === 'king'){
                        if (selectedPiece.color === 'white'){
                            whiteKingPosition = square.id;
                        } else {
                            blackKingPosition = square.id;
                        }
                    }
                } else {
                    // If a piece is selected, then a square is clicked, but it's not a legal move
                    const selectedSquare = document.getElementById(selectedPiece.square.id);
                    selectedSquare.style.backgroundColor = "";
                    console.log("piece deselected");
                    selectedPiece = null
                }
            } else {
                console.log("No selected piece");
            }
        });
    });
}

function deselectPiece() {
    if (selectedPiece) {
        const selectedSquare = document.getElementById(selectedPiece.square.id);
        selectedSquare.style.backgroundColor = "";
        selectedPiece = null;
        console.log("piece deselected");
    }
}

function getPosition(square) {
    const id = square.id;
    const file = files.indexOf(id[0]);
    const rank = parseInt(id[1]);
    return [file, rank];
}

function getAllLegalMoves(){
    whiteLegalMoves = [];
    blackLegalMoves = [];
    whiteAlivePieces.forEach(function(piece){
        piece.getLegalMoves();
    });
    blackAlivePieces.forEach(function(piece){
        piece.getLegalMoves();
    });
}

function isLegalLinearMove(piece, toFile, toRank){
    const square = squares[files[toFile] + toRank];
    let move = new Move(piece, piece.square, square);
    if (square.isEmpty()){
        // No piece on the target square, add move and keep searching
        piece.legalMoves.push(move);
        if (piece.color === 'white'){
            whiteLegalMoves.push(move);
        } else {
            blackLegalMoves.push(move);
        }
        return true;
    } else if (square.piece.color !== piece.color){
        // Piece of the opposite color on the target square, add move and stop searching
        move.setCapture();
        piece.legalMoves.push(move);
        if (this.color === 'white'){
            whiteLegalMoves.push(move);
        } else {
            blackLegalMoves.push(move);
        }
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

function disallowIllegalKingMoves(piece){ //TODO

}

function blundersCheck(){ //TODO check function
    return false;
}

initializeChessboard();
setStartingPosition();
enablePieceMovement();
getAllLegalMoves();