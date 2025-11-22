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

  const hit = (index, playerNo) => {
    if (playerOne.playerNo === playerNo) {
      shipListOfPlayerOne[index].damage += 1;

      if (shipListOfPlayerOne[index].length === shipListOfPlayerOne[index].damage) {
        isSunk(index, playerNo);
      }
    } else {
      shipListOfPlayerTwo[index].damage += 1;

      if (shipListOfPlayerTwo[index].length === shipListOfPlayerTwo[index].damage) {
        isSunk(index, playerNo);
      }
    }
  };

  const isSunk = (index, playerNo) => {
    if (playerOne.playerNo === playerNo) {
      shipListOfPlayerOne[index].sunk = true;
      let sunkCounterOfPlayerOne = 0;

      for (const ship of shipListOfPlayerOne) {
        if (ship.sunk === true) {
          sunkCounterOfPlayerOne += 1;
        } 
      }

      if (sunkCounterOfPlayerOne === totalShips) {
        console.log('Player one lose');
      }
    } else {
      shipListOfPlayerTwo[index].sunk = true;
      let sunkCounterOfPlayerTwo = 0;

      for (const ship of shipListOfPlayerTwo) {
        if (ship.sunk === true) {
          sunkCounterOfPlayerTwo += 1;
        }
      }

      if (sunkCounterOfPlayerTwo === totalShips) {
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

  const receiveAttack = (x, y, playerNo) => {
    if (board[x][y] === 0) {
      board[x][y] = 1;
    } else {
      if (board[x][y] === 'B') {
        shipList[0].hit(0, playerNo);
      } else if (board[x][y] === 'C') {
        shipList[1].hit(1, playerNo);
      } else if (board[x][y] === 'D') {
        shipList[2].hit(2, playerNo);
      } else if (board[x][y] === 'S') {
        shipList[3].hit(3, playerNo);
      }
      
      board[x][y] = 'X';
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

function player(playerNo, playerType) {
  return {
    playerNo,
    playerType,
    board: gameBoard(),
  };
}

const playerOne = player(1, 'human');
const playerTwo = player(2, 'computer');

playerOne.board.deployShip(0, 0, 4, 'horizontal');
playerOne.board.deployShip(2, 2, 3, 'vertical');
playerOne.board.deployShip(4, 4, 2, 'horizontal');
playerOne.board.deployShip(6, 6, 1);

playerTwo.board.deployShip(5, 2, 4, 'horizontal');
playerTwo.board.deployShip(2, 7, 3, 'vertical');
playerTwo.board.deployShip(1, 4, 2, 'horizontal');
playerTwo.board.deployShip(7, 3, 1);

const shipListOfPlayerOne = playerOne.board.getShipList();
const currentBoardOfPlayerOne = playerOne.board.getBoard();
const shipListOfPlayerTwo = playerTwo.board.getShipList();
const currentBoardOfPlayerTwo = playerTwo.board.getBoard();

playerOne.board.receiveAttack(1, 2, 1);
playerTwo.board.receiveAttack(0, 1, 2);
playerOne.board.receiveAttack(2, 2, 1);
playerTwo.board.receiveAttack(2, 7, 2);
playerOne.board.receiveAttack(3, 2, 1);
playerTwo.board.receiveAttack(7, 3, 2);
playerOne.board.receiveAttack(4, 2, 1);
playerTwo.board.receiveAttack(7, 4, 2);
playerOne.board.receiveAttack(0, 0, 1);
playerOne.board.receiveAttack(0, 1, 1);
playerOne.board.receiveAttack(0, 2, 1);
playerOne.board.receiveAttack(0, 3, 1);
playerOne.board.receiveAttack(4, 4, 1);
playerOne.board.receiveAttack(4, 5, 1);
playerOne.board.receiveAttack(1, 3, 1);
playerOne.board.receiveAttack(2, 3, 1);
playerOne.board.receiveAttack(2, 4, 1);
playerOne.board.receiveAttack(6, 5, 1);
// playerOne.board.receiveAttack(6, 6, 1);

console.log(shipListOfPlayerTwo);
console.log(currentBoardOfPlayerTwo);

module.exports = gameBoard;
