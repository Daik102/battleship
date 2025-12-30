function ship(length) {
  const totalShips = 4;
  let type = '';
  let body = [];
  let direction = '';

  if (length === 4) {
    type = 'battleship';
  } else if (length === 3) {
    type = 'cruiser';
  } else if (length === 2) {
    type = 'destroyer';
  } else if (length === 1) {
    type = 'submarine';
  }

  const hit = (playerNo, index) => {
    shipLists[playerNo - 1][index].damage += 1;
  };

  const isSunk = (playerNo, index) => {
    shipLists[playerNo - 1][index].sunk = true;
  };

  const getTotalShips = () => totalShips;

  return {
    type,
    length,
    body,
    direction,
    damage: 0,
    sunk: false,
    hit,
    isSunk,
    getTotalShips,
  };
}

export function gameBoard() {
  const row = 8;
  const column = 8;
  const shipList = [];
  let board = Array.from({ length: row }, () => Array(column).fill(0));
  
  const deployShip = (x, y, length, direction) => {
    const newShip = ship(length);
    newShip.direction = direction;
    
    for (let i = 0; i < length; i++) {
      if (direction === 'horizontal') {
        newShip.body.push([x, y + i]);
      } else {
        newShip.body.push([x + i, y]);
      }
    }
    
    shipList.push(newShip);
    
    for (let i = 0; i < length; i++) {
      if (direction === 'horizontal') {
        board[x][y + i] = 'S';
      } else {
        board[x + i][y] = 'S';
      }
    }
  };

  const rotateShip = (x, y) => {
    let currentShip;
    let length = 0;
    let direction = '';
    let cannotRotate;
    
    for (let i = 0; i < shipLists[0].length; i++) {
      const ship = shipLists[0][i];
      const bow = ship.body[0];
      
      if (bow[0] === x && bow[1] === y) {
        currentShip = ship;
        length = ship.length;
        direction = ship.direction;
      }
    }
    
    if (length === 1) {
      return;
    }

    for (let i = 1; i < length; i++) {
      if (direction === 'horizontal') {
        // Check if it's possible to rotate vertically.
        let bottomSquare;
        let bottomLeftSquare;
        let bottomRightSquare;

        if (board[x + i]) {
          if (board[x + i + 1]) {
            bottomSquare = board[x + i + 1][y];
            bottomLeftSquare = board[x + i + 1][y - 1];
            bottomRightSquare = board[x + i + 1][y + 1];

          if (bottomSquare === 'S' || bottomLeftSquare === 'S' || bottomRightSquare === 'S') {
            cannotRotate = true;
            return cannotRotate;
          }
            
          }
        } else {
          cannotRotate = true;
          return cannotRotate
        }
      } else {
        // Check if it's possible to rotate horizontally.
        const rotatedSquare = board[x][y + i];
        const rightSquare = board[x][y + i + 1];
        let topRightSquare;
        let bottomRightSquare;

        if (rotatedSquare === undefined) {
         cannotRotate = true;
          return cannotRotate;
        }
        
        if (board[x - 1]) {
          topRightSquare = board[x - 1][y + i + 1];
        }

        if (board[x + 1]) {
          bottomRightSquare = board[x + 1][y + i + 1];
        }

        if (rightSquare === 'S' || topRightSquare === 'S' || bottomRightSquare === 'S') {
          cannotRotate = true;
          return cannotRotate;
        } 
      }
    }

    if (currentShip.direction === 'horizontal') {
      currentShip.direction = 'vertical';
    } else {
      currentShip.direction = 'horizontal';
    }

    // Update ship's body(location).
    for (let i = 0; i < length; i++) {
      if (direction === 'horizontal') {
        currentShip.body[i] = [x + i, y];
      } else {
        currentShip.body[i] = [x, y + i];
      }
    }
    
    // Rotate ship to new direction and erase previous location
    for (let i = 1; i < length; i++) {
      if (direction === 'horizontal') {
        board[x + i][y] = 'S';
        board[x][y + i] = 0;
      } else {
        board[x][y + i] = 'S';
        board[x + i][y] = 0;
      }
    }
  };

  const moveShip = (x, y, x2, y2, randomDirection, player) => {
    let currentShip;
    let length = 0;
    let direction = '';
    let cannotMove;
    
    for (let i = 0; i < shipLists[player - 1].length; i++) {
      const ship = shipLists[player - 1][i];
      const bow = ship.body[0];
      
      if (bow[0] === x && bow[1] === y) {
        currentShip = ship
        length = ship.length;
        direction = ship.direction;
      }
    }
    
    if (randomDirection) {
      direction = randomDirection;
    } else {
      
      // Delete previous ship. It needs to avoid running to prevent accidental deletion when deploying randomly.
      for (let i = 0; i < length; i++) {
        if (direction === 'horizontal') {
          board[x][y + i] = 0;
        } else {
          if (board[x + 1] || length === 1) {
            board[x + i][y] = 0;
          }
        }
      }
    }

    let topLeftSquare;
    let topSquare;
    let topRightSquare;
    let bottomLeftSquare;
    let bottomSquare;
    let bottomRightSquare;

    for (let i = 0; i < length; i++) {
      if (direction === 'horizontal') {
        // Check if it's possible to move horizontally.
        const movedSquare = board[x2][y2 + i];
        const rightSquare = board[x2][y2 + i + 1];
        const leftSquare = board[x2][y2 + i - 1];

        if (movedSquare === undefined) {
          cannotMove = true;
          break;
        }
        
        if (board[x2 - 1]) {
          topLeftSquare = board[x2 - 1][y2 + i - 1];
          topSquare = board[x2 - 1][y2];
          topRightSquare = board[x2 - 1][y2 + i + 1];
        }

        if (board[x2 + 1]) {
          bottomLeftSquare = board[x2 + 1][y2 + i - 1];
          bottomSquare = board[x2 + 1][y2];
          bottomRightSquare = board[x2 + 1][y2 + i + 1];
        }
        
        if (topLeftSquare === 'S' || topSquare === 'S' || topRightSquare === 'S' || leftSquare === 'S' || rightSquare === 'S' || bottomLeftSquare === 'S' || bottomSquare === 'S' || bottomRightSquare === 'S') {
          cannotMove = true;
        }
      } else {
        // Check if it's possible to move vertically.
        let rightSquare;
        let leftSquare;

        if (board[x2 + i]) {
          rightSquare = board[x2 + i][y2 + 1];
          leftSquare = board[x2 + i][y2 - 1];

          if (board[x2 + i - 1]) {
            topLeftSquare = board[x2 + i - 1][y2 - 1];
            topSquare = board[x2 + i - 1][y2];
            topRightSquare = board[x2 + i - 1][y2 + 1];
          }

          if (board[x2 + i + 1]) {
            bottomLeftSquare = board[x2 + i + 1][y2 - 1];
            bottomSquare = board[x2 + i + 1][y2];
            bottomRightSquare = board[x2 + i + 1][y2 + 1];
          }

          if (topLeftSquare === 'S' || topSquare === 'S' || topRightSquare === 'S' || leftSquare === 'S' || rightSquare === 'S' || bottomLeftSquare === 'S' || bottomSquare === 'S' || bottomRightSquare === 'S') {
            cannotMove = true;
          }
        } else {
          cannotMove = true;
          break;
        }
      }
    }

    if (cannotMove) {
      if (randomDirection) {
        return cannotMove;
      }

      for (let i = 0; i < length; i++) {
        if (direction === 'horizontal') {
          board[x][y + i] = 'S';
        } else {
          board[x + i][y] = 'S';
        }
      }
      
      return cannotMove;
    }

    for (let i = 0; i < length; i++) {
      if (direction === 'horizontal') {
        currentShip.body[i] = [x2, y2 + i];
      } else {
        currentShip.body[i] = [x2 + i, y2];
      }
    }

    for (let i = 0; i < length; i++) {
      if (direction === 'horizontal') {
        board[x2][y2 + i] = 'S';
      } else {
        board[x2 + i][y2] = 'S';
      }
    }
  };

  const deployRandom = (player) => {
    board = Array.from({ length: row }, () => Array(column).fill(0));

    for (let i = 0; i < shipLists[player - 1].length; i++) {
      const currentShip = shipLists[player - 1][i];
      const bow = currentShip.body[0];
      let x = bow[0];
      let y = bow[1];
      let x2 = Math.floor(Math.random() * row);
      let y2 = Math.floor(Math.random() * column);
      let zeroOrOne = Math.floor(Math.random() * 2);
      let direction = '';
    
      if (zeroOrOne === 0) {
        direction = 'horizontal';
      } else {
        direction = 'vertical';
      }
      
      let cannotMove;

      if (player === 1) {
        cannotMove = playerOne.board.moveShip(x, y, x2, y2, direction, 1);
      } else {
        cannotMove = playerTwo.board.moveShip(x, y, x2, y2, direction, 2);
      }

      currentShip.direction = direction;
      
      while (cannotMove) {
        x2 = Math.floor(Math.random() * row);
        y2 = Math.floor(Math.random() * column);
        zeroOrOne = Math.floor(Math.random() * 2);
    
        if (zeroOrOne === 0) {
          direction = 'horizontal';
        } else {
          direction = 'vertical'; 
        }
        
        if (player === 1) {
          cannotMove = playerOne.board.moveShip(x, y, x2, y2, direction, 1);
        } else {
          cannotMove = playerTwo.board.moveShip(x, y, x2, y2, direction, 2);
        }
        
        currentShip.direction = direction;
      }
    }

    return board;
  };

  const receiveAttack = (x, y, playerNo) => {
    let currentShip;

    for (let i = 0; i < shipLists[playerNo - 1].length; i++) {
      const ship = shipLists[playerNo - 1][i];

      for (let j = 0; j < ship.body.length; j++) {
        const body = ship.body[j];
        const bodyX = Number(body[0]);
        const bodyY = Number(body[1]);

        if (bodyX === x && bodyY === y) {
          currentShip = ship;
        }
      }
    }

    const square = currentBoards[playerNo - 1][x][y];
    let notFinished;

    if (square === 0) {
      currentBoards[playerNo - 1][x][y] = 1;
    } else if (square !== 'S') {
      notFinished = true;
      return notFinished;
    } else {
      let index = 0;

      if (currentShip.type === 'cruiser') {
        index = 1;
      } else if (currentShip.type === 'destroyer') {
        index = 2;
      } else if (currentShip.type === 'submarine') {
        index = 3;
      }

      shipLists[playerNo - 1][index].hit(playerNo, index);
      currentBoards[playerNo - 1][x][y] = 'X';
      
      // put splash after hitting
      if (currentBoards[playerNo - 1][x - 1]) {
        if (currentBoards[playerNo - 1][x - 1][y - 1] === 0) {
          currentBoards[playerNo - 1][x - 1][y - 1] = 2;
        }

        if (currentBoards[playerNo - 1][x - 1][y + 1] === 0) {
          currentBoards[playerNo - 1][x - 1][y + 1] = 2;
        }
      }

      if (currentBoards[playerNo - 1][x + 1]) {
        if (currentBoards[playerNo - 1][x + 1][y - 1] === 0) {
          currentBoards[playerNo - 1][x + 1][y - 1] = 2;
        }

        if (currentBoards[playerNo - 1][x + 1][y + 1] === 0) {
          currentBoards[playerNo - 1][x + 1][y + 1] = 2;
        }
      }

      const currentScoreBoard = document.querySelector('.current-score-board');
      const hiScoreBoard = document.querySelector('.hi-score-board');

      if (playerNo === 2) {
        currentScore += 500;
        const padScore = currentScore.toString().padStart(6, '0');
        currentScoreBoard.textContent = padScore;

        if (currentScore > hiScore) {
          hiScore = currentScore;
          const padHiScore = hiScore.toString().padStart(6, '0');
          hiScoreBoard.textContent = 'Hi ' + padHiScore;
        }
      }

      if (shipLists[playerNo - 1][index].length === shipLists[playerNo - 1][index].damage) {
        shipLists[playerNo - 1][index].isSunk(playerNo, index);

        // Put splash after sinking
        for (let i = 0; i < shipLists[playerNo - 1][index].length; i++) {
          const body = shipLists[playerNo - 1][index].body[i];
          const bodyX = body[0];
          const bodyY = body[1];
          currentBoards[playerNo - 1][bodyX][bodyY] = 'D';

          if (currentBoards[playerNo - 1][bodyX - 1]) {
            if (currentBoards[playerNo - 1][bodyX - 1][bodyY] === 0) {
              currentBoards[playerNo - 1][bodyX - 1][bodyY] = 2;
            }
          }

          if (currentBoards[playerNo - 1][bodyX][bodyY - 1] === 0) {
            currentBoards[playerNo - 1][bodyX][bodyY - 1] = 2;
          }
        
          if (currentBoards[playerNo - 1][bodyX][bodyY + 1] === 0) {
            currentBoards[playerNo - 1][bodyX][bodyY + 1] = 2;
          }

          if (currentBoards[playerNo - 1][bodyX + 1]) {
            if (currentBoards[playerNo - 1][bodyX + 1][bodyY] === 0) {
              currentBoards[playerNo - 1][bodyX + 1][bodyY] = 2;
            }
          }
        }
        console.log(currentBoards[playerNo - 1]);
        // Check if player or computer wins
        const sunkCounter = shipLists[playerNo - 1].reduce((acc, curr) => acc + curr.sunk, 0);
        const totalShips = ship().getTotalShips();
        
        if (sunkCounter === totalShips) {
          if (playerNo === 1) {
            message.textContent = 'You lose';
          } else {
            message.textContent = 'You win!';
            const dialogVictory = document.querySelector('.dialog-victory');
            const continueBtn = document.querySelector('.continue-btn');
            const bonusScores = document.querySelectorAll('.bonus-score');
            const totalBonusScore = document.querySelector('.total-bonus-score');
            let totalBonus = 0;

            bonusScores.forEach((score, i) => {
              let bonus = 2000 - i * 500;
              
              if (!shipLists[0][i].sunk) {
                score.textContent = bonus;
                totalBonus += bonus
              } else {
                score.textContent = 0;
              }
            });

            totalBonusScore.textContent = totalBonus;

            currentScore += totalBonus;
            const padScore = currentScore.toString().padStart(6, '0');
            let padHiScore = '';

            if (currentScore > hiScore) {
              hiScore = currentScore;
              padHiScore = hiScore.toString().padStart(6, '0');
            }

            setTimeout(() => {
              dialogVictory.showModal();
              currentScoreBoard.textContent = padScore;
              hiScoreBoard.textContent = 'Hi ' + padHiScore;

              continueBtn.addEventListener('click', (e) => {
                e.preventDefault();
                dialogVictory.close();
              });
            }, 1500);
          }

          gameOver = true;
          renderBoard(playerNo);
        }
      }

      notFinished = true
    }

    renderBoard();
    return notFinished;
  };

  const renderBoard = (playerNo) => {
    const row = playerOne.board.getRow();
    const column = playerOne.board.getColumn();
    boardContainerOne.innerHTML = '';
    boardContainerTwo.innerHTML = '';
  
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < column; j++) {
        const squareOne = document.createElement('li');
        squareOne.classList.add('square-one');
        squareOne.setAttribute('x', i);
        squareOne.setAttribute('y', j);

        const squareTwo = document.createElement('li');
        squareTwo.classList.add('square-two');
        squareTwo.setAttribute('x', i);
        squareTwo.setAttribute('y', j);

        if (currentBoards[0][i][j] === 1) {
          squareOne.classList.add('miss');
        } else if (currentBoards[0][i][j] === 2) {
          squareOne.classList.add('splash');
        } else if (currentBoards[0][i][j] === 'X' || currentBoards[0][i][j] === 'D') {
          squareOne.classList.add('hit');
        } else if (currentBoards[0][i][j] !== 0) {
          squareOne.classList.add('ship');
          squareOne.setAttribute('draggable', 'false');
        }

        if (currentBoards[1][i][j] === 1) {
          squareTwo.classList.add('miss');
        } else if (currentBoards[1][i][j] === 2) {
          squareTwo.classList.add('splash');
        } else if (currentBoards[1][i][j] === 'X' || currentBoards[1][i][j] === 'D') {
          squareTwo.classList.add('hit');
        } else if (currentBoards[1][i][j] !== 0) {
          squareTwo.classList.add('ship');
        }

        if (initial) {
          squareOne.setAttribute('draggable', 'true');
          squareTwo.classList.add('initial');

          if (currentBoards[0][i][j] !== 0) {
            squareOne.classList.add('grabbing');
          }
        }

        if (playerNo === 2) {
          boardContainerTwo.classList.add('dark');
          boardContainerTwo.classList.add('finished');
        } else if (playerNo === 1) {
          boardContainerOne.classList.add('dark');
          boardContainerTwo.classList.add('finished');
        }

        boardContainerOne.appendChild(squareOne);
        boardContainerTwo.appendChild(squareTwo);
      }
    }
  }

  const getShipList = () => shipList;
  const getBoard = () => board;
  const getRow = () => row;
  const getColumn = () => column;
  
  return {
    deployShip,
    rotateShip,
    moveShip,
    deployRandom,
    receiveAttack,
    renderBoard,
    getShipList,
    getBoard,
    getRow,
    getColumn,
  };
}

function player(playerNo, playerType) {
  return {
    playerNo,
    playerType,
    board: gameBoard(),
  };
}

const playerOne = player(1, 'human');
const playerTwo = player(2, 'computer');

const shipLists = [playerOne.board.getShipList(), playerTwo.board.getShipList()];
const currentBoards = [playerOne.board.getBoard(), playerTwo.board.getBoard()];

const boardContainerOne = document.querySelector('.board-container-one');
const boardContainerTwo = document.querySelector('.board-container-two');

const message = document.querySelector('.message');

let gameOver;
let initial = true;
let currentScore = 0;
let hiScore = 5000;

function playGame() {
  const myGameBoard = gameBoard();
  playerOne.board.deployShip(0, 1, 4, 'horizontal');
  playerOne.board.deployShip(5, 3, 3, 'vertical');
  playerOne.board.deployShip(3, 6, 2, 'horizontal');
  playerOne.board.deployShip(6, 1, 1, 'vertical');

  playerTwo.board.deployShip(5, 2, 4, 'horizontal');
  playerTwo.board.deployShip(2, 7, 3, 'vertical');
  playerTwo.board.deployShip(1, 4, 2, 'horizontal');
  playerTwo.board.deployShip(7, 3, 1, 'vertical');

  currentBoards[1] = playerTwo.board.deployRandom(2);

  const randomBtn = document.querySelector('.random-btn');

  randomBtn.addEventListener('click', () => {
    if (gameStart) {
      location.reload();
    }

    currentBoards[0] = playerOne.board.deployRandom(1);
    myGameBoard.renderBoard();
  });

  boardContainerOne.addEventListener('click', (e) => {
    if (gameStart) {
      return;
    }

    const target = e.target;
    const x = Number(target.getAttribute('x'));
    const y = Number(target.getAttribute('y'));
    const squares = document.querySelectorAll('.square-one');
    
    for (let i = 0; i < shipLists[0].length; i++) {
      const ship = shipLists[0][i]
      const bow = ship.body[0];

      for (let j = 0; j < ship.body.length; j++) {
        let body = ship.body[j];
        let bodyX = body[0];
        let bodyY = body[1];
        
        if (x === bodyX && y === bodyY) {
          const cannotRotate = playerOne.board.rotateShip(bow[0], bow[1]);

          if (cannotRotate) {
            for (let k = 0; k < ship.body.length; k++) {
              body = ship.body[k];
              bodyX = body[0];
              bodyY = body[1];
              
              squares.forEach((square) => {
                const squareX = Number(square.getAttribute('x'));
                const squareY = Number(square.getAttribute('y'));

                if (squareX === bodyX && squareY === bodyY) {
                  square.classList.toggle('caution');

                  setTimeout(() => {
                    square.classList.toggle('caution');
                  }, 200);
                }
              });
            }
          } else {
            myGameBoard.renderBoard();
          }
        }
      }
    }
  });

  let startTarget;
  let startX = 0;
  let startY = 0;

  boardContainerOne.addEventListener('dragstart', (e) => {
    startTarget = e.target;
    startX = Number(startTarget.getAttribute('x'));
    startY = Number(startTarget.getAttribute('Y'));
  });

  boardContainerOne.addEventListener('dragover', (e) => {
    if (gameStart) {
      return;
    }
    
    e.preventDefault();
  });

  boardContainerOne.addEventListener('drop', (e) => {
    const endTarget = e.target;
    let endX = Number(endTarget.getAttribute('x'));
    let endY = Number(endTarget.getAttribute('Y'));
    let currentShip;
    let bodyIndex = 0;
    
    for (let i = 0; i < shipLists[0].length; i++) {
      const ship = shipLists[0][i];

      for (let j = 0; j < ship.body.length; j++) {
        const body = ship.body[j];
        const bodyX = Number(body[0]);
        const bodyY = Number(body[1]);

        if (bodyX === startX && bodyY === startY) {
          currentShip = ship;
          bodyIndex = j;
        }
      }
    }

    const bow = currentShip.body[0];
    const direction = currentShip.direction;
    
    if (bow) {
      startX = bow[0];
      startY = bow[1];

      if (direction === 'horizontal') {
        endY -= bodyIndex;
      } else {
        
        endX -= bodyIndex;
      }
    }  

    const cannotMove = playerOne.board.moveShip(startX, startY, endX, endY, 0, 1);

    if (cannotMove) {
      startTarget.classList.add('caution');

      setTimeout(() => {
        startTarget.classList.remove('caution');
      }, 200);

      return;
    }

    myGameBoard.renderBoard();
  });

  function markupTarget() {
    if (gameOver) {
      return;
    }

    const squares = document.querySelectorAll('.square-two');

    squares.forEach((square) => {
      square.addEventListener('mouseenter', () => {
        square.classList.toggle('target');
      });

      square.addEventListener('mouseleave', () => {
        square.classList.toggle('target');
      });
    });
  }

  const squaresArray = Array.from({ length: 64}, (_, i) => i);
  let playerAttacked;

  function getComputerMove() {
    const row = playerTwo.board.getRow();
    const column = playerTwo.board.getColumn();
    
    let randomIndex = Math.floor(Math.random() * squaresArray.length);
    let targetSquare = squaresArray[randomIndex];
    let x = Math.floor(targetSquare / row);
    let y = targetSquare % column;
    let hitNeighborSquares = [];
  
    // Check if there is a damaged enemy ship
    for (let i = 0; i < row; i++) {
      const boardRow = currentBoards[0][i];
      for (let j = 0; j < column; j++) {
        const square = boardRow[j];

        if (square === 'X') {
          if (currentBoards[0][i - 1]) {
            if (currentBoards[0][i - 1][j] !== 1 && currentBoards[0][i - 1][j] !== 2 && currentBoards[0][i - 1][j] !== 'X') {
              hitNeighborSquares.push((i - 1) * row + j);
            }
          }
          
          if (currentBoards[0][i][j - 1] !== 1 && currentBoards[0][i][j - 1] !== 2 && currentBoards[0][i][j - 1] !== 'X' && j % row !== 0) {
            hitNeighborSquares.push(i * row + j - 1);
          }
          
          if (currentBoards[0][i][j + 1] !== 1 && currentBoards[0][i][j + 1] !== 2 && currentBoards[0][i][j + 1] !== 'X' && j % row !== row - 1) {
            hitNeighborSquares.push(i * row + j + 1);
          }
          
          if (currentBoards[0][i + 1]) {
            if (currentBoards[0][i + 1][j] !== 1 && currentBoards[0][i + 1][j] !== 2 && currentBoards[0][i + 1][j] !== 'X') {
              hitNeighborSquares.push((i + 1) * row + j);
            }
          }
        }
      }
    }
    
    if (hitNeighborSquares.length !== 0) {
      randomIndex = Math.floor(Math.random() * hitNeighborSquares.length);
      targetSquare = hitNeighborSquares[randomIndex];
      x = Math.floor(targetSquare / row);
      y = targetSquare % column;
    }

    setTimeout(() => {
      const result = playerOne.board.receiveAttack(x, y, 1);
      const targetIndex = squaresArray.indexOf(targetSquare);
      squaresArray.splice(targetIndex, 1);
      
      if (result) {
        // Erase splash squares from squaresArray
        for (let i = 0; i < row; i++) {
          for (let j = 0; j < column; j++) {
            const square = currentBoards[0][i][j];
            
            if (square === 2) {
              const squareNumber = i * row + j;
              
              for (let i = 0; i < squaresArray.length; i++) {
                const number = squaresArray[i];

                if (number === squareNumber) {
                  squaresArray.splice(i, 1);
                }
              }
            }
          }
        }

        if (gameOver) {
          return;
        }
        
        getComputerMove();
      } else {
        message.textContent = 'Your turn';
        playerAttacked = false;
        markupTarget();
      }
    }, 1000);
  }

  const playBtn = document.querySelector('.play-btn');
  let gameStart;

  playBtn.addEventListener('mouseenter', () => {
    if (!gameStart) {
      playBtn.classList.add('play-btn-hover');
    }
  });

  playBtn.addEventListener('mouseleave', () => {
    if (!gameStart) {
      playBtn.classList.remove('play-btn-hover');
    }
  });

  playBtn.addEventListener('click', () => {
    if (gameOver) {
      return;
    }

    gameStart = true;
    message.textContent = 'Your turn';
    randomBtn.textContent = 'Reset';
    randomBtn.classList.remove('opacity');
    randomBtn.classList.add('reset-btn');
    playBtn.classList.add('opacity');
    initial = false;
    myGameBoard.renderBoard();
    markupTarget();
  
    boardContainerTwo.addEventListener('click', (e) => {
      if (playerAttacked || gameOver) {
        return;
      }

      const target = e.target;
      const x = Number(target.getAttribute('x'));
      const y = Number(target.getAttribute('y'));
      const result = playerTwo.board.receiveAttack(x, y, 2);
      
      if (result) {
        markupTarget();
      } else {
        playerAttacked = true;
        message.textContent = 'Computer\'s turn';
        getComputerMove();
      }
    });
  });
}

playGame();

// module.exports = ship;
