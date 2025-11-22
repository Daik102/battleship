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

  const hit = (index) => {
    shipList[index].damage += 1;
        
    if (shipList[index].length === shipList[index].damage) {
      isSunk(index);
    }
  };

  const isSunk = (index) => {
    shipList[index].sunk = true;
    let sunkCounter = 0;

    for (const ship of shipList) {
      if (ship.sunk === true) {
        sunkCounter += 1;
      } 
    }

    if (sunkCounter === totalShips) {
      console.log('You lose');
    }
  };

  return {
    type,
    length,
    damage: 0,
    sunk: false,
    hit,
  };
}

function gameBoard() {
  const row = 8;
  const column = 8;
  const shipList = [];
  const board = Array.from({ length: row}, () => Array(column).fill(0));
  
  const deployShip = (x, y, length, direction) => {
    const newShip = ship(length);
    const type = newShip.type.slice(0, 1).toUpperCase();
    let lengthCounter = 0;
    shipList.push(newShip);

    if (direction === 'horizontal') {
      while (lengthCounter < length) {
        board[x][y + lengthCounter] = type;
        lengthCounter += 1;
      }
    } else {
      while (lengthCounter < length) {
        board[x + lengthCounter][y] = type;
        lengthCounter += 1;
      }
    }
  };

  const receiveAttack = (x, y) => {
    if (board[x][y] === 'B') {
      shipList[0].hit(0);
    } else if (board[x][y] === 'C') {
      shipList[1].hit(1);
    } else if (board[x][y] === 'D') {
      shipList[2].hit(2);
    } else if (board[x][y] === 'S') {
      shipList[3].hit(3);
    }

    if (board[x][y] === 'B' || board[x][y] === 'C' ||board[x][y] === 'D' || board[x][y] === 'S') {
      board[x][y] = 'X';
    } else {
      board[x][y] = 1;
    }
  };

  const getShipList = () => shipList;
  const getBoard = () => board;
  
  
  return {
    deployShip,
    receiveAttack,
    getShipList,
    getBoard,
  };
}

const board = gameBoard();

board.deployShip(0, 0, 4, 'horizontal');
board.deployShip(2, 2, 3, 'vertical');
board.deployShip(4, 4, 2, 'horizontal');
board.deployShip(6, 6, 1);

const shipList = board.getShipList();
const currentBoard = board.getBoard();

board.receiveAttack(1, 2);
board.receiveAttack(2, 2);
board.receiveAttack(3, 2);
board.receiveAttack(4, 2);
board.receiveAttack(0, 0);
board.receiveAttack(0, 1);
board.receiveAttack(0, 2);
board.receiveAttack(0, 3);
board.receiveAttack(4, 4);
board.receiveAttack(4, 5);
board.receiveAttack(1, 3);
board.receiveAttack(2, 3);
board.receiveAttack(2, 4);
board.receiveAttack(6, 5);
board.receiveAttack(6, 6);

console.log(shipList);
console.log(currentBoard);

module.exports = gameBoard;
