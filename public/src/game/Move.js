export class Move {
    constructor(piece, from, to, isCapture = false, isEnPassant = false, piecePromoted = null, castleType = null) {
        this.piece = piece;
        this.from = from;
        this.to = to;
        this.isCapture = isCapture;
        this.isCheck = false;
        this.isCheckmate = false;
        this.isEnPassant = isEnPassant;
        this.piecePromoted = piecePromoted;
        this.castleType = castleType;
        this.disambiguateFile = null;
        this.disambiguateRank = null;
    }

    static pieceNotation = {
        'pawn': '',
        'rook': 'R',
        'knight': 'N',
        'bishop': 'B',
        'queen': 'Q',
        'king': 'K'
    };

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
    }

    setPromotion(piece) {
        this.piecePromoted = piece;
    }

    setCastle(type) {
        this.castleType = type;
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
            move = Move.pieceNotation[pieceType];
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
            move += this.to.id;
            if (this.piecePromoted) {
                move += '=' + Move.pieceNotation[this.piecePromoted];
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

    isEqualTo(move) {
        return this.piece === move.piece &&
            this.from === move.from &&
            this.to === move.to;
    }
}