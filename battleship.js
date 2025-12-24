function ship(length) {
  const totalShips = 4;
  let type = '';

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
        console.log('Player one lose');
      } else {
        console.log('Player two lose');
      }
    }
  };

  return {
    type,
    length,
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
  const board = Array.from({ length: row }, () => Array(column).fill(0));
  
  const deployShip = (x, y, length, direction) => {
    const newShip = ship(length);
    const type = newShip.type.slice(0, 1).toUpperCase();
    let lengthCounter = 0;
    shipList.push(newShip);

    while (lengthCounter < length) {
      if (direction === 'horizontal') {
        board[x][y + lengthCounter] = type;
      } else {
        board[x + lengthCounter][y] = type;
      }
      
      lengthCounter += 1;
    }
  };

  const rotateShip = (x, y) => {
    const type = currentBoards[0][x][y];
    const nextSquare = currentBoards[0][x][y + 1];
    const shipTypesList = ['B', 'C', 'D', 'S'];
    let length = 0;
    let lengthCounter = 1;

    if (type === 'S') {
      return console.log('Can\'t move');
    }

    if (type === 'B') {
      length = 4;
    } else if (type === 'C') {
      length = 3;
    } else if (type === 'D') {
      length = 2;
    }

    while (lengthCounter < length) {
      if (type === nextSquare) {
        // Check if it's possible to rotate vertically.

        let bottomSquare;
        let bottomLeftSquare;
        let bottomRightSquare;

        if (board[x + lengthCounter]) {
          if (board[x + lengthCounter + 1]) {
            bottomSquare = board[x + lengthCounter + 1][y];
            bottomLeftSquare = board[x + lengthCounter + 1][y - 1];
            bottomRightSquare = board[x + lengthCounter + 1][y + 1];

            for (let i = 0; i < shipTypesList.length; i++) {
              const type = shipTypesList[i];

              if (bottomSquare === type || bottomLeftSquare === type || bottomRightSquare === type) {
                return console.log('Can\'t move');
              }
            }
          }
        } else {
          return console.log('Can\'t move');
        }
      } else {
        // Check if it's possible to rotate horizontally.

        const rotatedSquare = board[x][y + lengthCounter];
        const rightSquare = board[x][y + lengthCounter + 1];
        let topRightSquare;
        let bottomRightSquare;

        if (rotatedSquare === undefined) {
          return console.log('Can\'t move');
        }
        
        if (board[x - 1]) {
          topRightSquare = board[x - 1][y + lengthCounter + 1];
        }

        if (board[x + 1]) {
          bottomRightSquare = board[x + 1][y + lengthCounter + 1];
        }

        for (let i = 0; i < shipTypesList.length; i++) {
          const type = shipTypesList[i];

          if (rightSquare === type || topRightSquare === type || bottomRightSquare === type) {
            return console.log('Can\'t move');
          }
        }
      }
      
      lengthCounter += 1;
    }

    lengthCounter = 0;
    
    while (lengthCounter < length) {
      if (type === nextSquare) {
        board[x + lengthCounter][y] = type;
      } else {
        board[x][y + lengthCounter] = type;
      }
      
      lengthCounter += 1;
    }

    lengthCounter = 1;

    while (lengthCounter < length) {
      if (type === nextSquare) {
        board[x][y + lengthCounter] = 0;
      } else {
        board[x + lengthCounter][y] = 0;
      }
      
      lengthCounter += 1;
    }
  };

  const receiveAttack = (x, y, playerNo) => {
    const location = currentBoards[playerNo - 1][x][y];
    let index = 0;
    
    if (location === 'C') {
      index = 1;
    } else if (location === 'D') {
      index = 2;
    } else if (location === 'S') {
      index = 3;
    }

    if (location === 0) {
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

        if (currentBoards[playerNo - 1][x - 1]) {
          if (currentBoards[playerNo - 1][x - 1][y] === 0) {
            currentBoards[playerNo - 1][x - 1][y] = 2;
          }
        }

        if (currentBoards[playerNo - 1][x][y - 1] === 0) {
          currentBoards[playerNo - 1][x][y - 1] = 2;
        }
      
        if (currentBoards[playerNo - 1][x][y + 1] === 0) {
          currentBoards[playerNo - 1][x][y + 1] = 2;
        }

        if (currentBoards[playerNo - 1][x + 1]) {
          if (currentBoards[playerNo - 1][x + 1][y] === 0) {
            currentBoards[playerNo - 1][x + 1][y] = 2;
          }
        }
      }
    }

    renderBoard();
  };

  const getShipList = () => shipList;
  const getBoard = () => board;
  
  return {
    deployShip,
    rotateShip,
    receiveAttack,
    getShipList,
    getBoard,
  };
}

function player(playerNo, playerType) {
  return {
    playerNo,
    playerType,
    board: gameBoard(),
  };
}

export function renderBoard(row = 8, column = 8) {
  const boardContainerOne = document.querySelector('.board-container-one');
  const boardContainerTwo = document.querySelector('.board-container-two');
  boardContainerOne.innerHTML = '';
  boardContainerTwo.innerHTML = '';

  for (let i = 0; i < row; i++) {
    for (let j = 0; j < column; j++) {
      const squareOne = document.createElement('div');
      const squareTwo = document.createElement('div');
      squareOne.classList.add('square');
      squareTwo.classList.add('square');

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
      } else if (currentBoards[1][i][j] !== 0) {
        squareTwo.classList.add('ship');
      }

      boardContainerOne.appendChild(squareOne);
      boardContainerTwo.appendChild(squareTwo);
    }
  } 
}

const playerOne = player(1, 'human');
const playerTwo = player(2, 'computer');

playerOne.board.deployShip(3, 2, 4, 'horizontal');
playerOne.board.deployShip(5, 7, 3, 'vertical');
playerOne.board.deployShip(7, 4, 2, 'horizontal');
playerOne.board.deployShip(0, 7, 1);

playerTwo.board.deployShip(5, 2, 4, 'horizontal');
playerTwo.board.deployShip(2, 7, 3, 'vertical');
playerTwo.board.deployShip(1, 4, 2, 'horizontal');
playerTwo.board.deployShip(7, 3, 1);

const shipLists = [playerOne.board.getShipList(), playerTwo.board.getShipList()];
const currentBoards = [playerOne.board.getBoard(), playerTwo.board.getBoard()];

playerOne.board.rotateShip(3, 2);

console.log(currentBoards[0]);

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

console.log(shipLists[0]);

console.log(shipLists[1]);
console.log(currentBoards[1]);
*/
console.log(currentBoards[0]);

// module.exports = ship;
