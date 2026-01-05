import "./styles.css";
import { player } from "../battleship.js";

const randomBtn = document.querySelector('.random-btn');
const playBtn = document.querySelector('.play-btn');
const boardContainerOne = document.querySelector('.board-container-one');
const boardContainerTwo = document.querySelector('.board-container-two');
const continueBtns = document.querySelectorAll('.continue-btn');
const dialogVictory = document.querySelector('.dialog-victory');
const dialogDefeat = document.querySelector('.dialog-defeat');

let playerOne = player(1, 'human');
let playerTwo = player(2, 'computer');
playerOne.board.deployShip();
playerTwo.board.deployShip();
playerTwo.board.deployRandom();

playerOne.board.updateRecords();
playerOne.board.updateMessage('Deploy your fleet');
playerOne.board.updateBtn();

playerOne.board.renderBoard(1, playerTwo.board.getBoard());

function resetGame() {
  const records = playerOne.board.updateRecords('getRecords');
  const currentScore = records[0];
  const hiScore = records[1];
  const currentVictory = records[2];
  const highestVictory = records[3];
  
  playerOne = player(playerOne.playerNo, playerOne.playerType, currentScore, hiScore, currentVictory, highestVictory);
  playerTwo = player(playerTwo.playerNo, playerTwo.playerType);
  playerOne.board.deployShip();
  playerTwo.board.deployShip();
  playerTwo.board.deployRandom();
  
  playerOne.board.updateRecords();
  playerOne.board.updateMessage('Deploy your fleet');
  playerOne.board.updateBtn();
  
  playerOne.board.renderBoard(1, playerTwo.board.getBoard());
}

randomBtn.addEventListener('click', () => {
  const currentTurn = playerOne.board.getCurrentTurn();

  if (currentTurn !== 0) {
    playerOne.board.updateRecords(0, 0);
    resetGame();
    return;
  }

  playerOne.board.deployRandom();
  playerOne.board.renderBoard(1, playerTwo.board.getBoard());
});

boardContainerOne.addEventListener('click', (e) => {
  const currentTurn = playerOne.board.getCurrentTurn();

  if (currentTurn !== 0) {
    return;
  }

  const target = e.target;
  const x = Number(target.getAttribute('x'));
  const y = Number(target.getAttribute('y'));
  playerOne.board.setRotateLocation(x, y, playerTwo.board.getBoard());
});

boardContainerOne.addEventListener('dragstart', (e) => {
  const startTarget = e.target;
  const startX = Number(startTarget.getAttribute('x'));
  const startY = Number(startTarget.getAttribute('Y'));
  playerOne.board.setStartLocation(startTarget, startX, startY);
});

boardContainerOne.addEventListener('dragover', (e) => {
  const currentTurn = playerOne.board.getCurrentTurn();

  if (currentTurn !== 0) {
    return;
  }
  
  e.preventDefault();
});

boardContainerOne.addEventListener('drop', (e) => {
  const endTarget = e.target;
  const endX = Number(endTarget.getAttribute('x'));
  const endY = Number(endTarget.getAttribute('Y'));
  playerOne.board.setEndLocation(endX, endY, playerTwo.board.getBoard());
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
  const currentTurnOne = playerOne.board.getCurrentTurn;
  const currentTurnTwo = playerTwo.board.getCurrentTurn;

  if (currentTurnOne === 3 || currentTurnTwo === 3) {
    return;
  }

  playerOne.board.startGame();
  playerTwo.board.startGame();
  playerOne.board.updateMessage('Your turn');
  playerOne.board.updateBtn();
  playerOne.board.renderBoard(1, playerTwo.board.getBoard());
  playerOne.board.markupTarget();
});

boardContainerTwo.addEventListener('click', (e) => {
  const currentTurnOne = playerOne.board.getCurrentTurn();
  const currentTurnTwo = playerTwo.board.getCurrentTurn();

  if (currentTurnOne === 0 || currentTurnOne === 2 || currentTurnOne === 3 || currentTurnTwo === 3) {
    return;
  }

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

    if (winner === 2) {
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
});
      
continueBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    dialogVictory.close();
    dialogDefeat.close();

    const winner = playerOne.board.checkTheWinner(1);

    if (winner === 1) {
      playerOne.board.updateRecords(0, 0);
    }

    resetGame();
  });
});
