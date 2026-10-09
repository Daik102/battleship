import "./styles.css";
import { createPlayer } from "./battleship.js";

const randomBtn = document.querySelector('.random-btn');
const playBtn = document.querySelector('.play-btn');
const boardContainerOne = document.querySelector('.board-container-one');
const boardContainerTwo = document.querySelector('.board-container-two');
const hiScore = JSON.parse(localStorage.getItem('hiScore')) || 5000;
const highestVictory = JSON.parse(localStorage.getItem('highestVictory')) || 0;

const playerOne = createPlayer({
  playerNo: 1,
  playerType: 'human',
  currentTurn: 0,
  currentScore: 0,
  hiScore,
  currentVictory: 0,
  highestVictory,
  finishedGame: false,
  customSet: [],
});

const playerTwo = createPlayer({
  playerNo: 2,
  playerType: 'computer',
});

boardContainerOne.addEventListener('mouseover', () => playerOne.game.addHoverOnShip(playerOne));
boardContainerOne.addEventListener('click', (e) => playerOne.game.sendRotatingLocation(e, playerOne));
boardContainerOne.addEventListener('keydown', (e) => playerOne.game.sendRotatingLocation(e, playerOne));
boardContainerOne.addEventListener('dragstart', (e) => playerOne.board.setMovingLocation(e.target));
boardContainerOne.addEventListener('dragover', (e) => playerOne.game.preventDefault(e, playerOne));

boardContainerOne.addEventListener('drop', (e) => {
  playerOne.board.setMovingLocation(e.target, playerOne.ship.getList());
  playerOne.board.addTabIndex(playerOne.ship.getList());
});

randomBtn.addEventListener('click', (e) => playerOne.game.randomOrReset(e, playerOne, playerTwo));
randomBtn.addEventListener('keydown', (e) => playerOne.game.randomOrReset(e, playerOne, playerTwo));
playBtn.addEventListener('mouseenter', () => playerOne.game.addHoverOnPlayBtn(playerOne));
playBtn.addEventListener('mouseleave', () => playerOne.game.removeHoverOnPlayBtn(playerOne));
playBtn.addEventListener('click', () => playerOne.game.startGame(playerOne, playerTwo));
playBtn.addEventListener('keydown', (e) => playerOne.game.focusRandomBtn(e));
boardContainerTwo.addEventListener('click', (e) => playerOne.game.handleGame(e, playerOne, playerTwo));
boardContainerTwo.addEventListener('keydown', (e) => playerOne.game.handleGame(e, playerOne, playerTwo));
document.addEventListener('keydown', (e) => playerOne.game.handleKeyDown(e, playerOne, playerTwo));

playerOne.game.setUpGame(playerOne, playerTwo);
