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
        console.log('Player one lose');
      } else {
        console.log('Player two lose');
      }
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
        newShip.body.push([x + 1, y + i]);
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
                return console.log('Can\'t rotate');
              }
            }
          }
        } else {
          return console.log('Can\'t rotate');
        }
      } else {
        // Check if it's possible to rotate horizontally.

        const rotatedSquare = board[x][y + i];
        const rightSquare = board[x][y + i + 1];
        let topRightSquare;
        let bottomRightSquare;

        if (rotatedSquare === undefined) {
          return console.log('Can\'t rotate');
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
            return console.log('Can\'t rotate');
          }
        }
      }
    }

    if (currentShip.direction === 'horizontal') {
      currentShip.direction = 'vertical';
    } else {
      currentShip.direction = 'horizontal';
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

  const moveShip = (x, y, x2, y2, randomDirection) => {
    let currentShip;
    let length = 0;
    let direction = '';
    let cannotMove;

    for (let i = 0; i < shipLists[0].length; i++) {
      const ship = shipLists[0][i];
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

    let currentType = currentBoards[0][x][y];

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

  const deployRandom = () => {
    board = Array.from({ length: row }, () => Array(column).fill(0));

    for (let i = 0; i < shipLists[0].length; i++) {
      const currentShip = shipLists[0][i];
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
      
      let cannotMove = playerOne.board.moveShip(x, y, x2, y2, direction);
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
        cannotMove = playerOne.board.moveShip(x, y, x2, y2, direction);
        currentShip.direction = direction;
      }
    }

    return board;
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
    moveShip,
    deployRandom,
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
  boardContainerOne.innerHTML = '';
  boardContainerTwo.innerHTML = '';

  for (let i = 0; i < row; i++) {
    for (let j = 0; j < column; j++) {
      const squareOne = document.createElement('li');
      squareOne.classList.add('square');
      squareOne.setAttribute('x', i);
      squareOne.setAttribute('y', j);

      const squareTwo = document.createElement('li');
      squareTwo.classList.add('square');
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

const randomBtn = document.querySelector('.random-btn');
randomBtn.addEventListener('click', () => {
  currentBoards[0] = playerOne.board.deployRandom();
  renderBoard();
  console.log(shipLists[0]);
  console.log(currentBoards[0]);
});

const boardContainerOne = document.querySelector('.board-container-one');
const boardContainerTwo = document.querySelector('.board-container-two');

boardContainerOne.addEventListener('click', (e) => {
  const target = e.target
  const x = Number(target.getAttribute('x'));
  const y = Number(target.getAttribute('y'));
  
  for (let i = 0; i < shipLists[0].length; i++) {
    const ship = shipLists[0][i]
    const bow = ship.body[0];
    
    if (x === bow[0] && y === bow[1]) {
      playerOne.board.rotateShip(x, y);
      renderBoard();
      console.log(shipLists[0]);
      console.log(currentBoards[0]);
    }
  }
});

/*
playerOne.board.rotateShip(4, 2);

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
