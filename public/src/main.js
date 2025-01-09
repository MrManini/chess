import { Board } from './board/Board.js';
import { Game } from './game/Game.js';

const board = new Board();
const game = new Game(board);
game.start();
