export class Square {
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