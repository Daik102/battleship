import "./styles.css";
import { player } from "./battleship.js";

let playerOne = player(1, 'human');
let playerTwo = player(2, 'computer');

const randomBtn = document.querySelector('.random-btn');
const playBtn = document.querySelector('.play-btn');
const boardContainerOne = document.querySelector('.board-container-one');
const boardContainerTwo = document.querySelector('.board-container-two');
const moveOnBtn = document.querySelector('.move-on-btn');
const tryAgainBtn = document.querySelector('.try-again-btn');
const finaleBtn = document.querySelector('.finale-btn');
const dialogVictory = document.querySelector('.dialog-victory');
const dialogDefeat = document.querySelector('.dialog-defeat');
const dialogFinish = document.querySelector('.dialog-finish');

function setUpGame(initial) {
  let customSets;

  if (!initial) {
    const records = playerOne.board.getRecords();
    const currentScore = records[0];
    const hiScore = records[1];
    const currentVictory = records[2];
    const highestVictory = records[3];
    const finished = playerOne.board.getFinished();
    customSets = playerOne.list.getDeploySets();
    boardContainerTwo.classList.remove('dark');
    boardContainerOne.classList.remove('dark');
    
    playerOne = player(playerOne.playerNo, playerOne.playerType, currentScore, hiScore, currentVictory, highestVictory);
    playerTwo = player(playerTwo.playerNo, playerTwo.playerType);
    
    if (finished) {
      playerOne.board.setFinished('display');
    }
  }
  
  playerOne.list.deployShip(customSets);
  playerTwo.list.deployShip();
  playerOne.board.deployBoard(playerOne.list.getList());
  playerTwo.board.deployBoard(playerTwo.list.getList());
  playerTwo.board.deployRandom(playerTwo.list.getList());
  playerOne.board.updateRecords();
  playerOne.board.updateMessage('Deploy your fleet');
  playerOne.board.updateBtn();
  playerOne.board.renderBoard();
}

setUpGame('initial');

randomBtn.addEventListener('click', () => {
  const currentTurn = playerOne.board.getCurrentTurn();
  
  if (currentTurn === 0) {
    playerOne.board.deployRandom(playerOne.list.getList());
  } else if (currentTurn === 1) {
    playerOne.board.updateRecords('reset');
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
      playerOne.board.rotateShip(x, y, playerOne.list.getList());
    }
  }
});

boardContainerOne.addEventListener('dragstart', (e) => {
  playerOne.board.setMoveLocation(e.target);
});

boardContainerOne.addEventListener('dragover', (e) => {
  const currentTurn = playerOne.board.getCurrentTurn();

  if (currentTurn === 0) {
    e.preventDefault();
  }
});

boardContainerOne.addEventListener('drop', (e) => {
  playerOne.board.setMoveLocation(e.target, playerOne.list.getList());
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
  const currentTurn = playerOne.board.getCurrentTurn();

  if (currentTurn === 0) {
    playerOne.board.setCurrentTurn(1);
    playerOne.board.updateMessage('Your turn');
    playerOne.board.updateBtn();
    playerOne.board.renderBoard(1, playerTwo.board.getBoard());
    playerOne.board.markupTarget();
  }
});

boardContainerTwo.addEventListener('click', (e) => {
  const currentTurn = playerOne.board.getCurrentTurn();
  
  if (currentTurn === 1) {
    const target = e.target;
    const x = Number(target.getAttribute('x'));
    const y = Number(target.getAttribute('y'));

    if (target.classList.contains('board-container-two')) {
      return;
    }

    const result = playerTwo.board.receiveAttack(x, y, 2, playerTwo.list.getList(), playerOne.board.getBoard());
    
    if (result === 'hit') {
      playerOne.board.updateRecords('hit');
      const winner = playerTwo.board.checkTheWinner(2, playerTwo.list.getList(), playerOne.board.getBoard());

      if (winner) {
        const totalBonus = playerOne.board.getTotalBonus(playerOne.list.getList());
        playerOne.board.updateRecords(totalBonus, 'notRender');
      } else {
        playerOne.board.markupTarget();
      }
    } else if (result === 'miss') {
      playerOne.board.setCurrentTurn(2);
      playerOne.board.updateMessage('Computer\'s turn');
      playerOne.board.getComputerMove(wait, playerOne.list.getList(), playerTwo.board.getBoard());

      function wait() {
        playerOne.board.setCurrentTurn(1);
      }
    }
  }
});

moveOnBtn.addEventListener('click', () => {
  dialogVictory.close();
  const records = playerOne.board.getRecords();
  const currentVictory = records[2];
  
  if (currentVictory === 20) {
    dialogFinish.showModal();
    playerOne.board.updateRecords();
  } else {
    setUpGame();
  }
});

tryAgainBtn.addEventListener('click', () => {
  dialogDefeat.close();
  playerOne.board.updateRecords('reset');
  setUpGame();
});

finaleBtn.addEventListener('click', () => {
  dialogFinish.close();
  playerOne.board.updateRecords('reset');
  playerOne.board.setFinished();
  setUpGame();
});
