

export class Move {
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

    pieceNotation = {
        pawn: '',
        rook: 'R',
        knight: 'N',
        bishop: 'B',
        queen: 'Q',
        king: 'K'
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

    isEqualTo(move) {
        return this.piece === move.piece &&
            this.from === move.from &&
            this.to === move.to;
    }
}