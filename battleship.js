let gameStart;
let gameOver;
let initial = true;

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
    const sunkCounter = shipLists[playerNo - 1].reduce((acc, curr) => acc + curr.sunk, 0);
    
    if (sunkCounter === totalShips) {
      if (playerNo === 1) {
        message.textContent = 'You lose';
      } else {
        message.textContent = 'You win!';
      }

      gameOver = true;
      randomBtn.textContent = 'Reset';
      randomBtn.classList.remove('opacity');
      randomBtn.classList.add('reset-btn');
    }
  };

  return {
    type,
    length,
    body,
    direction,
    damage: 0,
    sunk: false,
    hit,
    isSunk,
  };
}

function gameBoard() {
  const row = 8;
  const column = 8;
  const shipList = [];
  let board = Array.from({ length: row }, () => Array(column).fill(0));
  
  const deployShip = (x, y, length, direction) => {
    const newShip = ship(length);
    const type = newShip.type.slice(0, 1).toUpperCase();

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
        board[x][y + i] = type;
      } else {
        board[x + i][y] = type;
      }
    }
  };

  const rotateShip = (x, y) => {
    const currentType = currentBoards[0][x][y];
    const shipTypesList = ['B', 'C', 'D', 'S'];
    let currentShip;
    let length = 0;
    let direction = '';
    let cannotRotate;
    
    for (let i = 0; i < shipLists[0].length; i++) {
      const ship = shipLists[0][i];
      const bow = ship.body[0];
      
      if (bow[0] === x && bow[1] === y) {
        currentShip = ship
        length = ship.length;
        direction = ship.direction;
      }
    }

    if (currentType === 'S') {
      return console.log('Can\'t rotate');
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

            for (let i = 0; i < shipTypesList.length; i++) {
              const type = shipTypesList[i];

              if (bottomSquare === type || bottomLeftSquare === type || bottomRightSquare === type) {
                console.log('Can\'t rotate');
                return cannotRotate = true;
              }
            }
          }
        } else {
          console.log('Can\'t rotate');
          return cannotRotate = true;
        }
      } else {
        // Check if it's possible to rotate horizontally.

        const rotatedSquare = board[x][y + i];
        const rightSquare = board[x][y + i + 1];
        let topRightSquare;
        let bottomRightSquare;

        if (rotatedSquare === undefined) {
          console.log('Can\'t rotate');
          return cannotRotate = true;
        }
        
        if (board[x - 1]) {
          topRightSquare = board[x - 1][y + i + 1];
        }

        if (board[x + 1]) {
          bottomRightSquare = board[x + 1][y + i + 1];
        }

        for (let i = 0; i < shipTypesList.length; i++) {
          const type = shipTypesList[i];

          if (rightSquare === type || topRightSquare === type || bottomRightSquare === type) {
            console.log('Can\'t rotate');
            return cannotRotate = true;
          }
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
        board[x + i][y] = currentType;
        board[x][y + i] = 0;
      } else {
        board[x][y + i] = currentType;
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
          if (board[x + 1]) {
            board[x + i][y] = 0;
          }
        }
      }
    }

    const shipTypesList = ['B', 'C', 'D', 'S'];
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
        
        for (let j = 0; j < shipTypesList.length; j++) {
          const type = shipTypesList[j];

          if (topLeftSquare === type || topSquare === type || topRightSquare === type || leftSquare === type || rightSquare === type  || bottomLeftSquare === type || bottomSquare === type || bottomRightSquare === type) {
            cannotMove = true;
            break;
          }
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

          for (let j = 0; j < shipTypesList.length; j++) {
            const type = shipTypesList[j];

            if (topLeftSquare === type || topSquare === type || topRightSquare === type || leftSquare === type || rightSquare === type  || bottomLeftSquare === type || bottomSquare === type || bottomRightSquare === type) {
              cannotMove = true;
              break;
            }
          }
        } else {
          cannotMove = true;
          break;
        }
      }
    }

    let currentType = currentBoards[player - 1][x][y];

    if (currentType === 0) {
      currentType = 'S';
    }

    if (cannotMove) {
      console.log('Can\'t move');

      if (randomDirection) {
        return cannotMove;
      }

      for (let i = 0; i < length; i++) {
        if (direction === 'horizontal') {
          board[x][y + i] = currentType;
        } else {
          board[x + i][y] = currentType;
        }
      }

      return;
    }

    for (let i = 0; i < length; i++) {
      if (direction === 'horizontal') {
        board[x2][y2 + i] = currentType;
      } else {
        board[x2 + i][y2] = currentType;
      }
    }

    for (let i = 0; i < length; i++) {
      if (direction === 'horizontal') {
        currentShip.body[i] = [x2, y2 + i];
      } else {
        currentShip.body[i] = [x2 + i, y2];
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
    const location = currentBoards[playerNo - 1][x][y];
    let index = 0;
    let notFinished;
    
    if (location === 'C') {
      index = 1;
    } else if (location === 'D') {
      index = 2;
    } else if (location === 'S') {
      index = 3;
    }

    if (location === 1 || location === 2 || location === 'X') {
      notFinished = true;
      return notFinished;
    } else if (location === 0) {
      currentBoards[playerNo - 1][x][y] = 1;
    } else {
      shipLists[playerNo - 1][index].hit(playerNo, index);
      currentBoards[playerNo - 1][x][y] = 'X';
      
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

      if (shipLists[playerNo - 1][index].length === shipLists[playerNo - 1][index].damage) {
        shipLists[playerNo - 1][index].isSunk(playerNo, index);
        console.log(shipLists[playerNo - 1][index].body);

        // Put splash after sinking

        for (let i = 0; i < shipLists[playerNo - 1][index].length; i++) {
          const body = shipLists[playerNo - 1][index].body[i];
          const bodyX = body[0];
          const bodyY = body[1];

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
      }

      notFinished = true
    }

    renderBoard();
    return notFinished;
  };

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

const squaresArray = Array.from({ length: 64}, (_, i) => i);

function getComputerMove() {
  message.textContent = 'Computer\'s turn';
  const row = playerTwo.board.getRow();
  const column = playerTwo.board.getColumn();

  const randomIndex = Math.floor(Math.random() * squaresArray.length);
  const targetSquare = squaresArray[randomIndex];
  const x = Math.floor(targetSquare / row);
  const y = targetSquare % column;

  setTimeout(() => {
    const result = playerOne.board.receiveAttack(x, y, 1);
    squaresArray.splice(randomIndex, 1);
    
    if (result) {
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
    }
  }, 1500);
}

export function renderBoard() {
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
      } else if (currentBoards[0][i][j] === 'X') {
        squareOne.classList.add('hit');
      } else if (currentBoards[0][i][j] !== 0) {
        squareOne.classList.add('ship');
      }

      if (currentBoards[1][i][j] === 1) {
        squareTwo.classList.add('miss');
      } else if (currentBoards[1][i][j] === 2) {
        squareTwo.classList.add('splash');
      } else if (currentBoards[1][i][j] === 'X') {
        squareTwo.classList.add('hit');
      }

      if (initial) {
        squareTwo.classList.add('initial');
      }

      boardContainerOne.appendChild(squareOne);
      boardContainerTwo.appendChild(squareTwo);
    }
  } 
}

const playerOne = player(1, 'human');
const playerTwo = player(2, 'computer');

playerOne.board.deployShip(0, 1, 4, 'horizontal');
playerOne.board.deployShip(5, 3, 3, 'vertical');
playerOne.board.deployShip(2, 6, 2, 'horizontal');
playerOne.board.deployShip(6, 1, 1, 'vertical');

playerTwo.board.deployShip(5, 2, 4, 'horizontal');
playerTwo.board.deployShip(2, 7, 3, 'vertical');
playerTwo.board.deployShip(1, 4, 2, 'horizontal');
playerTwo.board.deployShip(7, 3, 1, 'vertical');

const shipLists = [playerOne.board.getShipList(), playerTwo.board.getShipList()];
const currentBoards = [playerOne.board.getBoard(), playerTwo.board.getBoard()];

currentBoards[1] = playerTwo.board.deployRandom(2);
console.log(shipLists[1]);
console.log(currentBoards[1]);

const randomBtn = document.querySelector('.random-btn');
randomBtn.addEventListener('click', () => {
  if (gameOver) {
    location.reload();
  } else if (gameStart) {
    return;
  }

  currentBoards[0] = playerOne.board.deployRandom(1);
  renderBoard();
  console.log(shipLists[0]);
  console.log(currentBoards[0]);
});

const boardContainerOne = document.querySelector('.board-container-one');
const boardContainerTwo = document.querySelector('.board-container-two');

boardContainerOne.addEventListener('click', (e) => {
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
                }, 150);
              }
            });
          }
        } else {
          renderBoard();
          console.log(shipLists[0]);
          console.log(currentBoards[0]);
        }
      }
    }
  }
});

const playBtn = document.querySelector('.play-btn');
const message = document.querySelector('.message');
let playerAttacked;

playBtn.addEventListener('click', () => {
  if (gameStart || gameOver) {
    return;
  }

  gameStart = true;
  randomBtn.classList.add('opacity');
  playBtn.classList.add('opacity');
  message.textContent = 'Your turn';
  initial = false;
  renderBoard();
  boardContainerTwo.addEventListener('click', (e) => {
    if (playerAttacked || gameOver) {
      return;
    }

    const target = e.target;
    const x = Number(target.getAttribute('x'));
    const y = Number(target.getAttribute('y'));
    const result = playerTwo.board.receiveAttack(x, y, 2);
    
    if (!result) {
      playerAttacked = true;
      getComputerMove();
    }
  });
});

/*
playerOne.board.moveShip(0, 1, 1, 2);
playerOne.board.moveShip(7, 4, 3, 0);
playerOne.board.moveShip(4, 6, 5, 6);
*/

/*
playerOne.board.receiveAttack(1, 2, 1);
playerTwo.board.receiveAttack(0, 1, 2);
playerOne.board.receiveAttack(2, 2, 1);
playerTwo.board.receiveAttack(2, 7, 2);
playerOne.board.receiveAttack(0, 3, 1);
playerTwo.board.receiveAttack(7, 2, 2);
playerOne.board.receiveAttack(3, 2, 1);
playerTwo.board.receiveAttack(7, 3, 2);
playerOne.board.receiveAttack(4, 2, 1);
playerTwo.board.receiveAttack(7, 5, 2);
playerOne.board.receiveAttack(0, 0, 1);
playerOne.board.receiveAttack(0, 1, 1);
playerOne.board.receiveAttack(0, 2, 1);
playerOne.board.receiveAttack(4, 4, 1);
playerOne.board.receiveAttack(4, 5, 1);
playerOne.board.receiveAttack(2, 4, 1);
playerOne.board.receiveAttack(6, 5, 1);
playerOne.board.receiveAttack(6, 6, 1);

console.log(shipLists[1]);
console.log(currentBoards[1]);
*/
console.log(shipLists[0]);
console.log(currentBoards[0]);

// module.exports = ship;
