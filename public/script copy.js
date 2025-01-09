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








enablePieceMovement();
handlePromotionMenu();
getAllLegalMoves();