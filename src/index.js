import "./styles.css";
import { player } from "./battleship.js";

let playerOne = player(1, 'human');
let playerTwo = player(2, 'computer');

function setUpGame(initial) {
  let customSets;

  if (!initial) {
    const records = playerOne.info.getRecords();
    const currentScore = records[0];
    const currentVictory = records[1];
    const finished = playerOne.info.getFinished();
    customSets = playerOne.list.getDeploySets();
    
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

const randomBtn = document.querySelector('.random-btn');
const playBtn = document.querySelector('.play-btn');
const boardContainerOne = document.querySelector('.board-container-one');
const boardContainerTwo = document.querySelector('.board-container-two');

randomBtn.addEventListener('click', () => {
  const currentTurn = playerOne.info.getCurrentTurn();
  
  if (currentTurn === 0) {
    playerOne.board.deployRandom(playerOne.list.getList());
    playerOne.board.renderBoard();
  } else if (currentTurn === 1) {
    playerOne.info.updateRecords('reset');
    setUpGame();
  }
});

boardContainerOne.addEventListener('mouseenter', () => {
  const squares = document.querySelectorAll('.square-one');

  squares.forEach((square) => {
    const currentTurn = playerOne.info.getCurrentTurn();

    if (currentTurn !== 0) {
      return;
    }

    const coordinatesIndexArray = [];

    square.addEventListener('mouseenter', (e) => {
      if (e.target.classList.contains('ship')) {
        const x = Number(e.target.getAttribute('x'));
        const y = Number(e.target.getAttribute('y'));
        const list = playerOne.list.getList();
        
        for (let i = 0; i < list.length; i++) {
          const ship = list[i];
          
          for (let j = 0; j < ship.length; j++) {
            const coordinates = ship.coordinates[j];
            const coordinateX = coordinates[0];
            const coordinateY = coordinates[1];

            if (x === coordinateX && y === coordinateY) {
              for (let k = 0; k < ship.length; k++) {
                const coordinates = ship.coordinates[k];
                const coordinateX = coordinates[0];
                const coordinateY = coordinates[1];
                const coordinatesIndex = coordinateX * 8 + coordinateY;
                coordinatesIndexArray.push(coordinatesIndex);
                squares[coordinatesIndex].classList.add('ship-hover');
              }
            }
          }
        }
      }
    });

    square.addEventListener('mouseleave', () => {
      for (let i = 0; i < coordinatesIndexArray.length; i++) {
        const index = coordinatesIndexArray[i];
        squares[index].classList.remove('ship-hover');
      }
    });
  });
});

boardContainerOne.addEventListener('click', (e) => {
  const currentTurn = playerOne.info.getCurrentTurn();

  if (currentTurn === 0) {
    const x = Number(e.target.getAttribute('x'));
    const y = Number(e.target.getAttribute('y'));

    if (e.target.classList.contains('ship')) {
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
    playerOne.board.renderBoard(1, playerTwo.board.getBoard(), '', currentVictory);
    playerOne.board.markupTarget(playerTwo.board.getBoard());
  }
});

boardContainerTwo.addEventListener('click', (e) => {
  const currentTurn = playerOne.info.getCurrentTurn();
  
  if (currentTurn === 1) {
    const x = Number(e.target.getAttribute('x'));
    const y = Number(e.target.getAttribute('y'));

    if (e.target.classList.contains('board-container-two')) {
      return;
    }

    const result = playerTwo.board.receiveAttack(x, y, 2, playerTwo.list.getList(), playerOne.board.getBoard());
    
    if (result === 'hit' || result === 'sunk') {
      playerOne.info.updateRecords('hit');
      playerOne.board.markupTarget();
      const winner = playerTwo.board.checkTheWinner(1, playerTwo.list.getList());

      if (winner) {
        playerOne.info.setCurrentTurn(3);
        playerOne.info.displayResult(1, waitRender, playerOne.list.getList());
        // Callback for setTimeout.
        function waitRender(totalBonus) {
          playerOne.info.updateRecords(totalBonus, 'notRender');

          const moveOnBtn = document.querySelector('.move-on-btn');

          moveOnBtn.addEventListener('click', () => {
            boardContainerTwo.classList.remove('dark');
            const records = playerOne.info.getRecords();
            const currentVictory = records[1];
            
            if (currentVictory === 20) {
              playerOne.info.displayResult('finish');
              playerOne.info.updateRecords();

              const finaleBtn = document.querySelector('.finale-btn');

              finaleBtn.addEventListener('click', () => {
                playerOne.info.updateRecords('reset');
                playerOne.info.setFinished();
                setUpGame();
              });
            } else {
              setUpGame();
            }
          });
        }
      } else {
        playerOne.board.markupTarget(playerTwo.board.getBoard());
      }
    } else if (result === 'miss') {
      playerOne.info.setCurrentTurn(2);
      playerOne.info.updateMessage('Computer\'s turn');
      playerOne.board.markupTarget();
      playerOne.board.getComputerMove(waitComputerMove, playerOne.list.getList(), playerTwo.board.getBoard());
      // Callback for setTimeout.
      function waitComputerMove(winner) {
        if (winner) {
          playerOne.info.setCurrentTurn(3);
          playerOne.info.displayResult(2, waitRender);
          // Callback for setTimeout.
          function waitRender() {
            const tryAgainBtn = document.querySelector('.try-again-btn');
            
            tryAgainBtn.addEventListener('click', () => {
              playerOne.info.updateRecords('reset');
              setUpGame();
            });
          }
        } else {
          playerOne.info.setCurrentTurn(1);
          playerOne.info.updateMessage('Your turn');
          playerOne.board.markupTarget(playerTwo.board.getBoard());
        }
      }
    }
  }
});
