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
    const records = playerOne.info.getRecords();
    const currentScore = records[0];
    const currentVictory = records[1];
    const finished = playerOne.info.getFinished();
    customSets = playerOne.list.getDeploySets();
    boardContainerTwo.classList.remove('dark');
    boardContainerOne.classList.remove('dark');
    
    playerOne = player(playerOne.playerNo, playerOne.playerType, currentScore, currentVictory);
    playerTwo = player(playerTwo.playerNo, playerTwo.playerType);
    
    if (finished) {
      playerOne.info.setFinished('display');
    }
  }
  
  playerOne.list.deployShip(customSets);
  playerTwo.list.deployShip();
  playerOne.board.deployBoard(playerOne.list.getList());
  playerTwo.board.deployBoard(playerTwo.list.getList());
  playerTwo.board.deployRandom(playerTwo.list.getList());
  playerOne.info.updateRecords();
  playerOne.info.updateMessage('Deploy your fleet');
  playerOne.info.updateBtn();
  playerOne.board.renderBoard();
}

setUpGame('initial');

randomBtn.addEventListener('click', () => {
  const currentTurn = playerOne.info.getCurrentTurn();
  
  if (currentTurn === 0) {
    playerOne.board.deployRandom(playerOne.list.getList());
  } else if (currentTurn === 1) {
    playerOne.info.updateRecords('reset');
    setUpGame();
  }
});

boardContainerOne.addEventListener('click', (e) => {
  const currentTurn = playerOne.info.getCurrentTurn();

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
  const currentTurn = playerOne.info.getCurrentTurn();

  if (currentTurn === 0) {
    e.preventDefault();
  }
});

boardContainerOne.addEventListener('drop', (e) => {
  playerOne.board.setMoveLocation(e.target, playerOne.list.getList());
});

playBtn.addEventListener('mouseenter', () => {
  const currentTurn = playerOne.info.getCurrentTurn();

  if (currentTurn === 0) {
    playBtn.classList.add('play-btn-hover');
  }
});

playBtn.addEventListener('mouseleave', () => {
  const currentTurn = playerOne.info.getCurrentTurn();

  if (currentTurn === 0) {
    playBtn.classList.remove('play-btn-hover');
  }
});

playBtn.addEventListener('click', () => {
  const currentTurn = playerOne.info.getCurrentTurn();
  const records = playerOne.info.getRecords();
  const currentVictory = records[1];
  
  if (currentTurn === 0) {
    playerOne.info.setCurrentTurn(1);
    playerOne.info.updateMessage('Your turn');
    playerOne.info.updateBtn();
    playerOne.board.renderBoard(1, playerTwo.board.getBoard(), currentVictory);
    playerOne.board.markupTarget(playerTwo.board.getBoard());
  }
});

boardContainerTwo.addEventListener('click', (e) => {
  const currentTurn = playerOne.info.getCurrentTurn();
  
  if (currentTurn === 1) {
    const target = e.target;
    const x = Number(target.getAttribute('x'));
    const y = Number(target.getAttribute('y'));

    if (target.classList.contains('board-container-two')) {
      return;
    }

    const result = playerTwo.board.receiveAttack(x, y, 2, playerTwo.list.getList(), playerOne.board.getBoard());
    
    if (result === 'hit') {
      playerOne.info.updateRecords('hit');
      playerOne.board.markupTarget();
      const winner = playerTwo.board.checkTheWinner(1, playerTwo.list.getList());

      if (winner) {
        playerOne.info.displayResult(1);
        const totalBonus = playerOne.info.getTotalBonus(playerOne.list.getList());
        playerOne.info.updateRecords(totalBonus, 'notRender');
      } else {
        playerOne.board.markupTarget(playerTwo.board.getBoard());
      }
    } else if (result === 'miss') {
      playerOne.info.setCurrentTurn(2);
      playerOne.info.updateMessage('Computer\'s turn');
      playerOne.board.markupTarget();
      playerOne.board.getComputerMove(wait, playerOne.list.getList(), playerTwo.board.getBoard());
      // Callback for setTimeout.
      function wait(winner) {
        if (winner) {
          playerOne.info.displayResult(2);
        } else {
          playerOne.info.setCurrentTurn(1);
          playerOne.info.updateMessage('Your turn');
          playerOne.board.markupTarget(playerTwo.board.getBoard());
        }
      }
    }
  }
});

moveOnBtn.addEventListener('click', () => {
  dialogVictory.close();
  const records = playerOne.info.getRecords();
  const currentVictory = records[1];
  
  if (currentVictory === 20) {
    dialogFinish.showModal();
    playerOne.info.updateRecords();
  } else {
    setUpGame();
  }
});

tryAgainBtn.addEventListener('click', () => {
  dialogDefeat.close();
  playerOne.info.updateRecords('reset');
  setUpGame();
});

finaleBtn.addEventListener('click', () => {
  dialogFinish.close();
  playerOne.info.updateRecords('reset');
  playerOne.info.setFinished();
  setUpGame();
});
