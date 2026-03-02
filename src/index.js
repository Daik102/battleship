import "./styles.css";
import { createPlayer } from "./battleship.js";

const hiScore = JSON.parse(localStorage.getItem('hiScore')) || 5000;
const highestVictory = JSON.parse(localStorage.getItem('highestVictory')) || 0;
let playerOne = createPlayer(1, 'human', 0, hiScore, 0, highestVictory, false, []);
let playerTwo = createPlayer(2, 'computer');

function setUpGame(initial) {
  let customSet = [];

  if (!initial) {
    const currentScore = playerOne.currentScore;
    const highScore = playerOne.hiScore;
    const currentVictory = playerOne.currentVictory;
    const highestVictory = playerOne.highestVictory;
    const finishedGame = playerOne.finishedGame;
    customSet = playerOne.ship.getDeploySet(playerOne);

    playerOne = createPlayer(playerOne.playerNo, playerOne.playerType, currentScore, highScore, currentVictory, highestVictory, finishedGame, customSet);
    playerTwo = createPlayer(playerTwo.playerNo, playerTwo.playerType);
    
    if (finishedGame) {
      playerOne.info.setFinished();
    }
  }
  
  playerOne.ship.deployShip(customSet);
  playerTwo.ship.deployShip();
  playerOne.board.deployBoard(playerOne.ship.getList());
  playerTwo.board.deployBoard(playerTwo.ship.getList());
  playerTwo.board.deployRandom(playerTwo.ship.getList());
  playerOne.info.updateRecords(playerOne);
  playerOne.info.updateMessage('deploy');
  playerOne.info.updateBtn(playerOne.currentTurn);
  playerOne.board.renderBoard();
  playerOne.board.addTabIndex(playerOne.ship.getList());
}

setUpGame('initial');

const randomBtn = document.querySelector('.random-btn');
const playBtn = document.querySelector('.play-btn');
const boardContainerOne = document.querySelector('.board-container-one');
const boardContainerTwo = document.querySelector('.board-container-two');

function randomOrReset(e) {
  if (e instanceof KeyboardEvent) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      playBtn.focus();
    }

    if (e.key === ' ') {
      e.preventDefault();
    } else {
      return;
    }
  }
  
  const currentTurn = playerOne.currentTurn;
  
  if (currentTurn === 0) {
    playerOne.board.deployRandom(playerOne.ship.getList());
    playerOne.board.renderBoard();
    playerOne.board.addTabIndex(playerOne.ship.getList());
  } else if (currentTurn === 1) {
    playerOne.board.focusWithArrowKey('confirmation-on');
    playerOne.info.displayConfirmation();
    const doResetBtn = document.querySelector('.do-reset-btn');
    const cancelBtn = document.querySelector('.cancel-btn');
    cancelBtn.focus();
    
    function resetGame(e) {
      if (e instanceof KeyboardEvent) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Tab') {
          e.preventDefault();
          cancelBtn.focus();
        }
      } else {
        playerOne.board.focusWithArrowKey('confirmation-off');
        playerOne.info.updateRecords(playerOne, 'reset');
        setUpGame();
      }
    }

    doResetBtn.addEventListener('click', resetGame);
    doResetBtn.addEventListener('keydown', resetGame);

    function cancelReset(e) {
      if (e instanceof KeyboardEvent) {
        if(e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Tab') {
          e.preventDefault();
          doResetBtn.focus();
        }
      } else {
        playerOne.board.focusWithArrowKey('confirmation-off');
        playerOne.board.renderBoard(1, playerTwo.board.getBoard());
        playerOne.board.markupTarget(playerTwo.board.getBoard());
      }
    }
    
    cancelBtn.addEventListener('click', cancelReset);
    cancelBtn.addEventListener('keydown', cancelReset);
  }
}

randomBtn.addEventListener('click', randomOrReset);
randomBtn.addEventListener('keydown', randomOrReset);

// Change the ship's color when hovering.
boardContainerOne.addEventListener('mouseover', () => {
  const currentTurn = playerOne.currentTurn;

  if (currentTurn === 0) {
    playerOne.board.hoverShip(playerOne.ship.getList());
  }
});

function sendLocationToRotate(e) {
  if (e instanceof KeyboardEvent) {
    if (e.key !== 'Enter' && e.key !== ' ') {
      return;
    }
  }

  const currentTurn = playerOne.currentTurn;
  
  if (currentTurn === 0) {
    const x = Number(e.target.getAttribute('x'));
    const y = Number(e.target.getAttribute('y'));
  
    if (e.target.classList.contains('ship')) {
      playerOne.board.rotateShip(x, y, playerOne.ship.getList(), e);
      playerOne.board.addTabIndex(playerOne.ship.getList(), x, y);
    }
  }
}

boardContainerOne.addEventListener('click', sendLocationToRotate);
boardContainerOne.addEventListener('keydown', sendLocationToRotate);

boardContainerOne.addEventListener('dragstart', (e) => {
  playerOne.board.setMoveLocation(e.target);
});

boardContainerOne.addEventListener('dragover', (e) => {
  const currentTurn = playerOne.currentTurn;

  if (currentTurn === 0) {
    e.preventDefault();
  }
});

boardContainerOne.addEventListener('drop', (e) => {
  playerOne.board.setMoveLocation(e.target, playerOne.ship.getList());
  playerOne.board.addTabIndex(playerOne.ship.getList());
});

document.addEventListener('keydown', (e) => {
  const currentTurn = playerOne.currentTurn;

  if (currentTurn === 0) {
    const currentFocus = document.activeElement;

    if (currentFocus === document.body) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        randomBtn.focus();
        return;
      }
    }

    if (e.key === 'Tab') {
      playerOne.board.focusShip(playerOne.ship.getList());
    }

    if (e.key === 'Tab' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      playerOne.board.moveWithArrowKey(e, playerOne.ship.getList());
    }
  } else if (currentTurn === 1) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      playerOne.board.focusWithArrowKey('', playerTwo.board.getBoard(), e);
    }
  } else if (currentTurn === 3) {
    e.preventDefault();
    return;
  }

 if (e.key === 'r') {
    randomOrReset();
  } else if (e.key === 'p') {
    startGame();
  }
});

playBtn.addEventListener('mouseenter', () => {
  const currentTurn = playerOne.currentTurn;

  if (currentTurn === 0) {
    playBtn.classList.add('play-btn-hover');
  }
});

playBtn.addEventListener('mouseleave', () => {
  const currentTurn = playerOne.currentTurn;

  if (currentTurn === 0) {
    playBtn.classList.remove('play-btn-hover');
  }
});

function startGame() {
  const currentTurn = playerOne.currentTurn;
  
  if (currentTurn === 0) {
    const currentVictory = playerOne.currentVictory;

    playerOne.info.setCurrentTurn(playerOne, 1);
    playerOne.info.updateMessage('start');
    playerOne.info.updateBtn(playerOne.currentTurn);
    playerOne.board.renderBoard(1, playerTwo.board.getBoard(), '', currentVictory);
    playerOne.board.markupTarget(playerTwo.board.getBoard());
  }
}

playBtn.addEventListener('click', startGame);

playBtn.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    randomBtn.focus();
  }
});

function handleGame(e) {
  const currentTurn = playerOne.currentTurn;
  
  if (currentTurn === 1) {
    if (e instanceof KeyboardEvent) {
      if (e.key !== 'Enter' && e.key !==' ') {
        return;
      }
    }

    if (e.target.classList.contains('board-container-two')) {
      return;
    }

    const x = Number(e.target.getAttribute('x'));
    const y = Number(e.target.getAttribute('y'));
    const result = playerTwo.board.receiveAttack(x, y, 2, playerTwo.ship.getList(), playerOne.board.getBoard());
    
    if (result === 'hit' || result === 'sunk') {
      playerOne.info.updateRecords(playerOne, 'hit');
      const winner = playerTwo.board.checkTheWinner(1, playerTwo.ship.getList());

      if (winner) {
        playerOne.info.setCurrentTurn(playerOne, 3);
        playerOne.board.markupTarget();
        playerOne.info.displayResult(1, waitRender, playerOne.ship.getList());
        // Callback for setTimeout.
        function waitRender(totalBonus) {
          playerOne.info.updateRecords(playerOne, totalBonus, 'notRender');
          playerOne.info.rotateEmblem();
          
          const moveOnBtn = document.querySelector('.move-on-btn');
          moveOnBtn.focus();

          function moveOn(e) {
            if (e instanceof KeyboardEvent) {
              if (e.key !== 'Enter' && e.key !==' ') {
                return;
              }
            }
            
            boardContainerOne.classList.remove('erase-board', 'display-board');
            playerOne.info.rotateEmblem();
            const currentVictory = playerOne.currentVictory;
            
            if (currentVictory === 20) {
              playerOne.info.displayResult('finish');
              playerOne.info.updateRecords(playerOne);

              const finaleBtn = document.querySelector('.finale-btn');
              finaleBtn.focus();

              function finale(e) {
                if (e instanceof KeyboardEvent) {
                  if (e.key !== 'Enter' && e.key !==' ') {
                    return;
                  }
                }

                playerOne.info.rotateEmblem();
                playerOne.info.updateRecords(playerOne, 'reset');
                playerOne.info.setFinished(playerOne);
                setUpGame();
              }

              finaleBtn.addEventListener('click', finale);
              finaleBtn.addEventListener('keydown', finale);
            } else {
              setUpGame();
            }
          }

          moveOnBtn.addEventListener('click', moveOn);
          moveOnBtn.addEventListener('keydown', moveOn);
        }
      } else {
        playerOne.board.markupTarget(playerTwo.board.getBoard());
      }
    } else if (result === 'miss') {
      playerOne.info.setCurrentTurn(playerOne, 2);
      playerOne.info.updateMessage('Computer\'s turn');
      playerOne.board.markupTarget();
      playerOne.board.getComputerMove(waitComputerMove, playerOne.ship.getList(), playerTwo.board.getBoard());
      // Callback for setTimeout.
      function waitComputerMove(winner) {
        if (winner) {
          playerOne.info.setCurrentTurn(playerOne, 3);
          playerOne.info.displayResult(2, waitRender, '', playerOne.currentVictory);
          // Callback for setTimeout.
          function waitRender() {
            const tryAgainBtn = document.querySelector('.try-again-btn');
            tryAgainBtn.focus();

            function tryAgain(e) {
              if (e instanceof KeyboardEvent) {
                if (e.key !== 'Enter' && e.key !==' ') {
                  return;
                }
              }

              playerOne.info.updateRecords(playerOne, 'reset');
              setUpGame();
            }
            
            tryAgainBtn.addEventListener('click', tryAgain);
            tryAgainBtn.addEventListener('keydown', tryAgain);
          }
        } else {
          playerOne.info.setCurrentTurn(playerOne, 1);
          playerOne.info.updateMessage('Your turn');
          playerOne.board.markupTarget(playerTwo.board.getBoard());

          if (e instanceof KeyboardEvent) {
            playerOne.board.focusWithArrowKey('', playerTwo.board.getBoard());
          }
        }
      }
    }
  }
}

boardContainerTwo.addEventListener('click', handleGame);
boardContainerTwo.addEventListener('keydown', handleGame);
