const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
let selectedPiece = null;
let sideToMove = "white";
const selectedPieceColor = "#26995c";
let legalMoves = [];
let lastMove = null;

function initializeChessboard(){
    const chessboard = document.getElementById('chessboard');
    
    for (let row = 0; row < 8; row++){
        for (let column = 0; column < 8; column++){
            const square = document.createElement('div');
            square.classList.add('square');
        
            if ((row + column) % 2 == 0){
                square.classList.add('light');
            } else {
                square.classList.add('dark');
            }
            const squareId = files[column] + (8 - row);
            square.id = squareId;
    
            chessboard.appendChild(square);
        }
    }
}

function placePiece(piece, squares) {
    squares.forEach(function(square) {
        const pieceSquare = document.getElementById(square);
        const rank = square[1];
        const isWhite = rank === '1' || rank === '2';
        const color = isWhite ? 'white' : 'black';

        const pieceImg = document.createElement('img');
        pieceImg.src = `images/${piece}-${color}.svg`;
        pieceImg.classList.add(`${color}`);
        pieceImg.classList.add(`${piece}`);
        pieceImg.classList.add(`${square}`);
        pieceImg.style.width = '100%';
        pieceImg.style.height = '100%';
        pieceSquare.appendChild(pieceImg);
    });
}


function setStartingPosition() {
    const startingPositions = {
        pawn: ['a2', 'a7', 'b2', 'b7', 'c2', 'c7', 'd2', 'd7', 'e2', 'e7', 'f2', 'f7', 'g2', 'g7', 'h2', 'h7'],
        rook: ['a1', 'a8', 'h1', 'h8'],
        knight: ['b1', 'b8', 'g1', 'g8'],
        bishop: ['c1', 'f1', 'c8', 'f8'],
        queen: ['d1', 'd8'],
        king: ['e1', 'e8']
    };

    for (let piece in startingPositions) {
        placePiece(piece, startingPositions[piece]);
    }
}

function enablePieceMovement() {
    // Add a click event listener to all pieces
    document.querySelectorAll('img').forEach(function(piece) {
        piece.addEventListener('click', function(event) {
            event.stopPropagation();
            const pieceColor = [...piece.classList].find(cls => cls === 'white' || cls === 'black');
            const square = piece.parentElement;

            if (pieceColor === sideToMove && !selectedPiece){
                // No piece selected, select piece
                selectedPiece = piece;
                legalMoves = [];
                square.style.backgroundColor = selectedPieceColor;
                console.log(`${piece.classList} selected`);
                getLegalMoves(piece);
            } else if (pieceColor != sideToMove && selectedPiece && legalMoves.includes(square)){
                // Piece selected and clicked on piece of different color, capture piece
                square.style.backgroundColor = "";
                const selectedSquare = selectedPiece.parentElement;
                selectedSquare.style.backgroundColor = "";
                square.removeChild(piece);
                square.appendChild(selectedPiece);
                selectedPiece = null;
                console.log(`captured on ${square.id}`);
                sideToMove = (sideToMove === 'white') ? 'black' : 'white';
                console.log(`${sideToMove} to move`);
                legalMoves = [];
            } else if (pieceColor != sideToMove && selectedPiece && !legalMoves.includes(square)){
                // Piece selected and clicked on piece of different color, but not a legal move
                const selectedSquare = selectedPiece.parentElement;
                selectedSquare.style.backgroundColor = "";
                console.log("piece deselected");
            } else if(pieceColor === sideToMove && selectedPiece) {
                // Selected piece of the same color, de-select piece
                const selectedSquare = selectedPiece.parentElement;
                selectedSquare.style.backgroundColor = "";
                console.log("piece deselected");
                square.style.backgroundColor = selectedPieceColor;
                selectedPiece = piece;
                legalMoves = [];
                getLegalMoves(piece);
                console.log(`${piece.classList} selected`); 
            }
        });
    });

    // Add a click event listener to all squares
    document.querySelectorAll('.square').forEach(function(square) {
        square.addEventListener('click', function() {
            if (selectedPiece && legalMoves.includes(square)) {
                // If a piece is selected, then a square is clicked, the piece moves to that square
                const oldSquare = selectedPiece.parentElement;
                oldSquare.removeChild(selectedPiece);
                square.appendChild(selectedPiece);

                oldSquare.style.backgroundColor = "";
                selectedPiece = null;
                
                console.log(`moved to ${square.id}`);
                sideToMove = (sideToMove === 'white') ? 'black' : 'white';
                console.log(`${sideToMove} to move`);   
                legalMoves = [];
            } else if(selectedPiece && !legalMoves.includes(square)){
                // If a piece is selected, then a square is clicked, but it's not a legal move
                const selectedSquare = selectedPiece.parentElement;
                selectedSquare.style.backgroundColor = "";
                console.log("piece deselected");
                selectedPiece = null
            } else {
                console.log("No selected piece");
            }
        });
    });
}

function getPosition(square) {
    const id = square.id;
    const file = files.indexOf(id[0]);
    const rank = parseInt(id[1]);
    return [file, rank];
}

function getLegalMoves(piece) {
    const pieceType = piece.classList[1];
    const square = piece.parentElement;
    switch (pieceType) {
        case 'pawn':
            getLegalPawnMoves(piece, square);
            break;
        case 'rook':
            getLegalRookMoves(piece, square);
            break;
        case 'knight':
            getLegalKnightMoves(piece, square);
            break;
        case 'bishop':
            getLegalBishopMoves(piece, square);
            break;
        case 'queen':
            getLegalQueenMoves(piece, square);
            break;
        case 'king':
            getLegalKingMoves(piece, square);
            break;
    }
    console.log(legalMoves);
}


function getLegalPawnMoves(piece, fromSquare){ // TODO en passant and promotion
    const [fromFile, fromRank] = getPosition(fromSquare);
    const direction = piece.classList.contains('white') ? 1 : -1; // White moves "up", black "down"
    let toSquare = document.getElementById(files[fromFile] + (parseInt(fromRank) + direction));
    // One square forward
    if (
        !toSquare.hasChildNodes() &&        // No piece on the target square
        !blundersCheck()                    // Doesn't put the king in check
    ){
        legalMoves.push(toSquare);          // Pawn moves one square forward
    }
    toSquare = document.getElementById(files[fromFile] + (parseInt(fromRank) + 2 * direction));
    // Two squares forward
    if (
        fromRank === (piece.classList.contains('white') ? 2 : 7) &&  // Pawn is on the second (white) or seventh (black) rank
        !toSquare.hasChildNodes() &&            // No piece on the target square
        !blundersCheck()                        // Doesn't put the king in check
    ){
        legalMoves.push(toSquare);          // Pawn moves two squares forward
    }
    toSquare = document.getElementById(files[fromFile - direction] + (parseInt(fromRank) + direction));
    // One file to the left, one square forward
    if (
        toSquare &&                         // Square to the left is not null
        toSquare.hasChildNodes() &&         // Piece on the target square
        !blundersCheck()                    // Doesn't put the king in check
    ){
        legalMoves.push(toSquare);          // Pawn captures to the left
    }
    toSquare = document.getElementById(files[fromFile + direction] + (parseInt(fromRank) + direction));
    // One file to the right, one square forward
    if (
        toSquare &&                         // Square to the right is not null
        toSquare.hasChildNodes() &&         // Piece on the target square
        !blundersCheck()                    // Doesn't put the king in check
    ){
        legalMoves.push(toSquare);          // Pawn captures to the right
    }
}

function isLegalLinearMove(piece, toFile, toRank){
    const square = document.getElementById(files[toFile] + toRank);
    if (!square.hasChildNodes()){
        // No piece on the target square, add move and keep searching
        legalMoves.push(square);
        return true;
    } else if (square.firstChild.classList[0] !== piece.classList[0] ){
        // Piece of the opposite color on the target square, add move and stop searching
        legalMoves.push(square);
        return false;
    }
    // Piece of the same color on the target square, stop searching
    return false;
}

function getLegalRookMoves(piece, fromSquare){
    const [fromFile, fromRank] = getPosition(fromSquare);
    for (let file = fromFile - 1; file >= 0; file--){ // Move horizontally to the left
        let keepSearching = isLegalLinearMove(piece, file, fromRank);
        if (!keepSearching){
            break;
        }
    }
    for (let file = fromFile + 1; file <= 7; file++){ // Move horizontally to the right
        let keepSearching = isLegalLinearMove(piece, file, fromRank);
        if (!keepSearching){
            break;
        }
    }
    for (let rank = fromRank - 1; rank >= 1; rank--){ // Move vertically down
        let keepSearching = isLegalLinearMove(piece, fromFile, rank);
        if (!keepSearching){
            break;
        }
    }
    for (let rank = fromRank + 1; rank <= 8; rank++){ // Move vertically up
        let keepSearching = isLegalLinearMove(piece, fromFile, rank);
        if (!keepSearching){
            break;
        }
    }
}

function getLegalBishopMoves(piece, fromSquare){
    const [fromFile, fromRank] = getPosition(fromSquare);
    let file = fromFile + 1;
    let rank = fromRank + 1;
    while (file <= 7 && rank <= 8){ // Move diagonally up and to the right
        let keepSearching = isLegalLinearMove(piece, file, rank);
        if (!keepSearching){
            break;
        }
        file++;
        rank++;
    }
    file = fromFile + 1;
    rank = fromRank - 1;
    while (file <= 7 && rank >= 0){ // Move diagonally down and to the right
        let keepSearching = isLegalLinearMove(piece, file, rank);
        if (!keepSearching){
            break;
        }
        file++;
        rank--;
    }
    file = fromFile - 1;
    rank = fromRank + 1;
    while (file >= 0 && rank <= 8){ // Move diagonally up and to the left
        let keepSearching = isLegalLinearMove(piece, file, rank);
        if (!keepSearching){
            break;
        }
        file--;
        rank++;
    }
    file = fromFile - 1;
    rank = fromRank - 1;
    while (file >= 0 && rank >= 0){ // Move diagonally down and to the left
        let keepSearching = isLegalLinearMove(piece, file, rank);
        if (!keepSearching){
            break;
        }
        file--;
        rank--;
    }
}

function getLegalKnightMoves(piece, fromSquare){
    const [fromFile, fromRank] = getPosition(fromSquare);
    const knightMoves = [   // All possible knight moves
        [fromFile + 2, fromRank + 1], [fromFile + 2, fromRank - 1],
        [fromFile - 2, fromRank + 1], [fromFile - 2, fromRank - 1],
        [fromFile + 1, fromRank + 2], [fromFile + 1, fromRank - 2],
        [fromFile - 1, fromRank + 2], [fromFile - 1, fromRank - 2]
    ];
    knightMoves.forEach(function(move){
        const [file, rank] = move;  
        if (file >= 0 && file <= 7 && rank >= 1 && rank <= 8){
            const square = document.getElementById(files[file] + rank);
            if (square && (!square.hasChildNodes() || square.firstChild.classList[0] !== piece.classList[0])){
                // No piece on the target square or piece of the opposite color, add move
                legalMoves.push(square);
            }
        }
    });
}

function getLegalQueenMoves(piece, fromSquare){
    getLegalRookMoves(piece, fromSquare);
    getLegalBishopMoves(piece, fromSquare);
}

function getLegalKingMoves(piece, fromSquare){ // TODO castling
    const [fromFile, fromRank] = getPosition(fromSquare);
    const kingMoves = [     // All possible king moves
        [fromFile + 1, fromRank], [fromFile - 1, fromRank],
        [fromFile, fromRank + 1], [fromFile, fromRank - 1],
        [fromFile + 1, fromRank + 1], [fromFile + 1, fromRank - 1],
        [fromFile - 1, fromRank + 1], [fromFile - 1, fromRank - 1]
    ];
    kingMoves.forEach(function(move){
        const [file, rank] = move;
        if (file >= 0 && file <= 7 && rank >= 1 && rank <= 8){
            const square = document.getElementById(files[file] + rank);
            if (!square.hasChildNodes() || square.firstChild.classList[0] !== piece.classList[0]){
                // No piece on the target square or piece of the opposite color, add move
                legalMoves.push(square);
            }
        }
    });
}

function blundersCheck(){ //TODO check function
    return false;
}

initializeChessboard();
setStartingPosition();
enablePieceMovement();