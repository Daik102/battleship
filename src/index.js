import "./styles.css";
import { player } from "../battleship.js";

const randomBtn = document.querySelector('.random-btn');
const playBtn = document.querySelector('.play-btn');
const boardContainerOne = document.querySelector('.board-container-one');
const boardContainerTwo = document.querySelector('.board-container-two');
const moveOnBtn = document.querySelector('.move-on-btn');
const tryAgainBtn = document.querySelector('.try-again-btn');
const okayBtn = document.querySelector('.okay-btn');
const dialogVictory = document.querySelector('.dialog-victory');
const dialogDefeat = document.querySelector('.dialog-defeat');
const dialogFinish = document.querySelector('.dialog-finish');

let playerOne = player(1, 'human');
let playerTwo = player(2, 'computer');

function setUpGame(initial) {
  let customSets;

  if (!initial) {
    const records = playerOne.board.updateRecords('getRecords');
    const currentScore = records[0];
    const hiScore = records[1];
    const currentVictory = records[2];
    const highestVictory = records[3];
    customSets = playerOne.board.getDeploySets();
    
    playerOne = player(playerOne.playerNo, playerOne.playerType, currentScore, hiScore, currentVictory, highestVictory);
    playerTwo = player(playerTwo.playerNo, playerTwo.playerType);
  }
  
  playerOne.board.deployShip(customSets);
  playerTwo.board.deployShip();
  playerTwo.board.deployRandom();
  playerOne.board.updateRecords();
  playerOne.board.updateMessage('Deploy your fleet');
  playerOne.board.updateBtn();
  playerOne.board.renderBoard(1, playerTwo.board.getBoard());
}

setUpGame('initial');

randomBtn.addEventListener('click', () => {
  const currentTurn = playerOne.board.getCurrentTurn();
  
  if (currentTurn === 0) {
    playerOne.board.deployRandom();
    playerOne.board.renderBoard(1, playerTwo.board.getBoard());
  } else if (currentTurn === 1) {
    playerOne.board.updateRecords(0, 0);
    setUpGame();
  }
});

boardContainerOne.addEventListener('click', (e) => {
  const currentTurn = playerOne.board.getCurrentTurn();

  if (currentTurn === 0) {
    const target = e.target;
    const x = Number(target.getAttribute('x'));
    const y = Number(target.getAttribute('y'));

    if (target.classList.contains('ship')) {
      playerOne.board.rotateShip(x, y, playerTwo.board.getBoard());
    }
  }
});

boardContainerOne.addEventListener('dragstart', (e) => {
  const target = e.target;
  const startX = Number(target.getAttribute('x'));
  const startY = Number(target.getAttribute('Y'));
  playerOne.board.setMoveLocation(startX, startY, target);
});

boardContainerOne.addEventListener('dragover', (e) => {
  const currentTurn = playerOne.board.getCurrentTurn();

  if (currentTurn === 0) {
    e.preventDefault();
  }
});

boardContainerOne.addEventListener('drop', (e) => {
  const target = e.target;
  const endX = Number(target.getAttribute('x'));
  const endY = Number(target.getAttribute('Y'));
  playerOne.board.setMoveLocation(endX, endY, '', playerTwo.board.getBoard());
});

playBtn.addEventListener('mouseenter', () => {
  const currentTurn = playerOne.board.getCurrentTurn();

  if (currentTurn === 0) {
    playBtn.classList.add('play-btn-hover');
  }
});

playBtn.addEventListener('mouseleave', () => {
  const currentTurn = playerOne.board.getCurrentTurn();

  if (currentTurn === 0) {
    playBtn.classList.remove('play-btn-hover');
  }
});

playBtn.addEventListener('click', () => {
  const currentTurnOne = playerOne.board.getCurrentTurn();

  if (currentTurnOne === 0) {
    playerOne.board.changeTurn();
    playerTwo.board.changeTurn();
    playerOne.board.updateMessage('Your turn');
    playerOne.board.updateBtn();
    playerOne.board.renderBoard(1, playerTwo.board.getBoard());
    playerOne.board.markupTarget();
  }
});

boardContainerTwo.addEventListener('click', (e) => {
  const currentTurnOne = playerOne.board.getCurrentTurn();
  
  if (currentTurnOne === 1) {
    const target = e.target;
    const x = Number(target.getAttribute('x'));
    const y = Number(target.getAttribute('y'));

    if (target.classList.contains('board-container-two')) {
      return;
    }

    const result = playerTwo.board.receiveAttack(x, y, 2, playerOne.board.getBoard());
    
    if (result === 'hit') {
      playerOne.board.updateRecords(500);
      const winner = playerTwo.board.checkTheWinner(2, playerOne.board.getBoard());

      if (winner) {
        const totalBonus = playerOne.board.getTotalBonus();
        playerOne.board.updateRecords(totalBonus, 1, 'notRender');
        return;
      }

      playerOne.board.markupTarget();
    } else if (result === 'miss') {
      playerOne.board.changeTurn();
      playerOne.board.updateMessage('Computer\'s turn');
      playerOne.board.getComputerMove(playerTwo.board.getBoard());
      playerTwo.board.changeTurn();
    }
  }
});

moveOnBtn.addEventListener('click', (e) => {
  e.preventDefault();
  dialogVictory.close();

  const records = playerOne.board.updateRecords('getRecords');
  const currentVictory = records[2];

  if (currentVictory === 20) {
    dialogFinish.showModal();
    playerOne.board.updateRecords();
  } else {
    setUpGame();
  }
});

tryAgainBtn.addEventListener('click', (e) => {
  e.preventDefault();
  dialogDefeat.close();
  playerOne.board.updateRecords(0, 0);
  setUpGame();
});

okayBtn.addEventListener('click', (e) => {
  e.preventDefault();
  dialogFinish.close();
  playerOne.board.updateRecords(0, 0);
  setUpGame();
});
