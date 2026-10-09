function Ship() {
  let list = [];

  const createShip = (length, direction, bowX, bowY) => {
    const shipType = ['submarine', 'destroyer', 'cruiser', 'battleship'];
    const type = shipType[length - 1];
    const coordinates = [];

    for (let j = 0; j < length; j++) {
      if (direction === 'horizontal') {
        coordinates.push([bowX, bowY + j]);
      } else {
        coordinates.push([bowX + j, bowY]);
      }
    }

    const hit = (ship) => ship.damage += 1;
    
    const isSunk = (ship) => {
      if (ship.length === ship.damage) {
        return true;
      } else {
        return false;
      }
    };

    return {
      type,
      length,
      direction,
      coordinates,
      damage: 0,
      hit,
      isSunk,
    };
  }

  const deployShip = (customSet) => {
    list = [];
    const defaultSet = [[0, 1, 4, 'horizontal'], [5, 3, 3, 'vertical'], [3, 6, 2, 'horizontal'], [6, 1, 1, 'vertical']];
    let fleetSet = [];
    
    if (!customSet || customSet.length === 0) {
      fleetSet = defaultSet;
    } else {
      fleetSet = customSet;
    }
    
    for (let i = 0; i < fleetSet.length; i++) {
      const set = fleetSet[i];
      const bowX = set[0];
      const bowY = set[1];
      const length = set[2];
      const direction = set[3];
      const newShip = createShip(length, direction, bowX, bowY);
      list.push(newShip);
    }
  };

  const getDeploySet = (playerOne) => {
    const customSet = [];
    
    for (let i = 0; i < list.length; i++) {
      const ship = list[i];
      const x = ship.coordinates[0][0];
      const y = ship.coordinates[0][1];
      const length = ship.length;
      const direction = ship.direction;
      const set = [x, y, length, direction];
      customSet.push(set);
    }

    playerOne.customSet = customSet;
    return customSet;
  };

  const getList = () => list;

  return {
    deployShip,
    getDeploySet,
    getList,
  }
}

function GameBoard() {
  const row = 8;
  const column = 8;
  let board = Array.from({ length: row }, () => Array(column).fill(0));

  const deployBoard = (list) => {
    board = Array.from({ length: row }, () => Array(column).fill(0));

    for (let i = 0; i < list.length; i++) {
      const ship = list[i];
      const direction = ship.direction;
      const [bowX, bowY] = ship.coordinates[0];

      // GUARD CLAUSE: Validate coordinates BEFORE placing the ship
      for (let j = 0; j < ship.length; j++) {
        const currentX = direction === 'horizontal' ? bowX : bowX + j;
        const currentY = direction === 'horizontal' ? bowY + j : bowY;

        // Check 1: Is the coordinate outside 8x8 boundaries?
        if (currentX >= row || currentX < 0 || 
            currentY >= column || currentY < 0
        ) {
          console.error(`Error: Ship ${i} goes out of bounds!`);
          return false;
        }

        // Check 2: Is there already a ship ('S') in this spot?
        if (board[currentX][currentY] === 'S') {
          console.error(`Error: Ships are overlapping at [${currentX}][${currentY}]!`);
          return false;
        }
      }
    
      for (let j = 0; j < ship.length; j++) {
        if (direction === 'horizontal') {
          board[bowX][bowY + j] = 'S';
        } else {
          board[bowX + j][bowY] = 'S';
        }
      }
    }
    // For testing.
    return board;
  };

  const hoverShip = (list) => {
    const squareOnes = document.querySelectorAll('.square-one');
    const coordinatesIndexArray = [];

    squareOnes.forEach((squareOne) => {
      squareOne.addEventListener('mouseenter', (e) => {
        if (e.target.classList.contains('ship')) {
          const x = Number(e.target.getAttribute('x'));
          const y = Number(e.target.getAttribute('y'));
          
          for (let i = 0; i < list.length; i++) {
            const ship = list[i];
            
            for (let j = 0; j < ship.length; j++) {
              const [coordinateX, coordinateY] = ship.coordinates[j];

              if (x === coordinateX && y === coordinateY) {
                for (let k = 0; k < ship.length; k++) {
                  const [coordinateX, coordinateY] = ship.coordinates[k];
                  const coordinatesIndex = coordinateX * column + coordinateY;
                  coordinatesIndexArray.push(coordinatesIndex);
                  squareOnes[coordinatesIndex].classList.add('ship-hover');
                }
              }
            }
          }
        }
      });

      squareOne.addEventListener('mouseleave', () => {
        for (const coordinates of coordinatesIndexArray) {
          squareOnes[coordinates].classList.remove('ship-hover');
        }
      });
    });
  };

  const focusShip = (list) => {
    const squareOnes = document.querySelectorAll('.square-one');
    const focusingArray = [];
    
    squareOnes.forEach((squareOne) => {
      squareOne.addEventListener('focus', () => {
        const x = Number(squareOne.getAttribute('x'));
        const y = Number(squareOne.getAttribute('y'));

        for (let i = 0; i < list.length; i++) {
          const ship = list[i];
          const [bowX, bowY] = ship.coordinates[0];

          if (x === bowX && y === bowY) {
            for (let j = 0; j < ship.length; j++) {
              const [coordinateX, coordinateY] = ship.coordinates[j];
              const focusIndex = coordinateX * column + coordinateY;
              focusingArray.push(focusIndex);
              squareOnes[focusIndex].classList.add('square-one-focus');
            }
          }
        }
      });

      squareOne.addEventListener('blur', () => {
        for (const index of focusingArray) {
          squareOnes[index].classList.remove('square-one-focus');
        }
      });
    });
  };

  const rotateShip = (x, y, list) => {
    for (let i = 0; i < list.length; i++) {
      const ship = list[i];
      const length = ship.length;

      if (length === 1) {
        return;
      }

      for (let j = 0; j < length; j++) {
        let [coordinateX, coordinateY] = ship.coordinates[j];
        
        if (x === coordinateX && y === coordinateY) {
          const direction = ship.direction;
          const [bowX, bowY] = ship.coordinates[0];
          let cannotRotate;

          for (let k = 1; k < length; k++) {
            if (direction === 'horizontal') {
              // Check if it's possible to rotate vertically.
              if (board[bowX + k]) {
                if (board[bowX + k + 1]) {
                  const bottomSquare = board[bowX + k + 1][bowY];
                  const bottomLeftSquare = board[bowX + k + 1][bowY - 1];
                  const bottomRightSquare = board[bowX + k + 1][bowY + 1];

                  if (bottomSquare === 'S' || bottomLeftSquare === 'S' || bottomRightSquare === 'S') {
                    cannotRotate = true;
                    break;
                  }
                }
              } else {
                cannotRotate = true;
                break;
              }
            } else {
              // Check if it's possible to rotate horizontally.
              const rotatedSquare = board[bowX][bowY + k];
              const rightSquare = board[bowX][bowY + k + 1];
              let topRightSquare;
              let bottomRightSquare;

              if (board[bowX - 1]) {
                topRightSquare = board[bowX - 1][bowY + k + 1];
              }

              if (board[bowX + 1]) {
                bottomRightSquare = board[bowX + 1][bowY + k + 1];
              }

              if (rotatedSquare === undefined || rightSquare === 'S' || topRightSquare === 'S' || bottomRightSquare === 'S') {
                cannotRotate = true;
                break;
              }
            }
          }

          if (cannotRotate) {
            const squares = document.querySelectorAll('.square-one');

            for (let k = 0; k < length; k++) {
              [coordinateX, coordinateY] = ship.coordinates[k];
              
              squares.forEach((square) => {
                const squareX = Number(square.getAttribute('x'));
                const squareY = Number(square.getAttribute('y'));

                if (coordinateX === squareX && coordinateY === squareY) {
                  square.classList.add('caution');

                  setTimeout(() => {
                    square.classList.remove('caution');
                  }, 200);
                }
              });
            }
          } else {
            if (ship.direction === 'horizontal') {
              ship.direction = 'vertical';
            } else {
              ship.direction = 'horizontal';
            }
            // Update the ship's coordinates on the list.
            for (let k = 0; k < length; k++) {
              if (direction === 'horizontal') {
                ship.coordinates[k] = [bowX + k, bowY];
              } else {
                ship.coordinates[k] = [bowX, bowY + k];
              }
            }
            // Update the ship's coordinates and erase the previous ones on the board.
            for (let k = 1; k < length; k++) {
              if (direction === 'horizontal') {
                board[bowX + k][bowY] = 'S';
                board[bowX][bowY + k] = 0;
              } else {
                board[bowX][bowY + k] = 'S';
                board[bowX + k][bowY] = 0;
              }
            }

            renderBoard();
          }
        }
      }
    }
  };

  let cannotMoveVertically;

  const moveShip = (x, y, x2, y2, ship, randomDirection) => {
    const length = ship.length;
    let direction = ship.direction;;
    
    if (randomDirection) {
      direction = randomDirection;
    } else {
      // Delete the current ship's coordinates first to prevent colliding with its own coordinates.
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

    let cannotMove;

    let topLeftSquare;
    let topSquare;
    let topRightSquare;
    let rightSquare;
    let leftSquare;
    let bottomLeftSquare;
    let bottomSquare;
    let bottomRightSquare;

    for (let i = 0; i < length; i++) {
      if (direction === 'horizontal') {
        // Check if it's possible to move when the ship is horizontal.
        const movedSquare = board[x2][y2 + i];
        rightSquare = board[x2][y2 + i + 1];
        leftSquare = board[x2][y2 + i - 1];

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
      } else {
        // Check if it's possible to move when the ship is vertical.
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
        } else {
          cannotMove = true;
          //To prevent adding caution class when trying to move a ship below the board.
          cannotMoveVertically = true;
          break;
        }
      }

      if (topLeftSquare === 'S' || topSquare === 'S' || topRightSquare === 'S' || leftSquare === 'S' || rightSquare === 'S' || bottomLeftSquare === 'S' || bottomSquare === 'S' || bottomRightSquare === 'S') {
        cannotMove = true;
        break;
      }
    }

    if (cannotMove) {
      if (!randomDirection) {
        // Restore the previous coordinates when the ship cannot move.
        for (let i = 0; i < length; i++) {
          if (direction === 'horizontal') {
            board[x][y + i] = 'S';
          } else {
            board[x + i][y] = 'S';
          }
        }
      }
    
      return cannotMove;
    } else {
      ship.direction = direction;
      // Update the new coordinates when the ship can move.
      for (let i = 0; i < length; i++) {
        if (direction === 'horizontal') {
          ship.coordinates[i] = [x2, y2 + i];
          board[x2][y2 + i] = 'S';
        } else {
          ship.coordinates[i] = [x2 + i, y2];
          board[x2 + i][y2] = 'S';
        }
      }
    }
  };

  let startTarget = {};

  const setMovingLocation = (target, list) => {
    if (!list) {
      startTarget = target;
      return;
    }

    if (!startTarget.classList.contains('ship')) {
      return;
    }
    
    for (let i = 0; i < list.length; i++) {
      const ship = list[i];
      
      for (let j = 0; j < ship.length; j++) {
        const [coordinateX, coordinateY] = ship.coordinates[j];
        const startX = Number(startTarget.getAttribute('x'));
        const startY = Number(startTarget.getAttribute('Y'));
        
        if (coordinateX === startX && coordinateY === startY) {
          const direction = ship.direction;
          const [bowX, bowY] = ship.coordinates[0];
          const coordinatesIndex = j;
          let endX = Number(target.getAttribute('x'));
          let endY = Number(target.getAttribute('Y'));
          
          if (direction === 'horizontal') {
            endY -= coordinatesIndex;
          } else {
            endX -= coordinatesIndex;
          }
          
          const cannotMove = moveShip(bowX, bowY, endX, endY, ship);
    
          if (cannotMove) {
            if (!cannotMoveVertically) {
              const squareOnes = document.querySelectorAll('.square-one');

              for (let k = 0; k < ship.length; k++) {
                const [coordinateX, coordinateY] = ship.coordinates[k];
                const index = coordinateX * column + coordinateY;
                squareOnes[index].classList.add('caution');

                setTimeout(() => {
                  squareOnes[index].classList.remove('caution');
                }, 200);
              }
            } else {
              cannotMoveVertically = false;
            }
          } else {
            renderBoard();
          }

          return cannotMove;
        }
      }
    }
  };

  let focusIndex = -1;

  const moveWithArrowKey = (e, list) => {
    const playBtn = document.querySelector('.play-btn');
    const link = document.querySelector('.link');

    playBtn.addEventListener('focus', () => focusIndex = -1);
    link.addEventListener('focus', () => focusIndex = -1);

    const squareOnes = document.querySelectorAll('.square-one');
    squareOnes.forEach((squareOne, i) => squareOne.addEventListener('focus', () => focusIndex = i));

    if (focusIndex >= 0) {
      let length = 1;
      let cannotMove;

      for (let i = 0; i < list.length; i++) {
        const ship = list[i];
        const [coordinateX, coordinateY] = ship.coordinates[0];
        const squareX = Number(squareOnes[focusIndex].getAttribute('x'));
        const squareY = Number(squareOnes[focusIndex].getAttribute('y'));
        const direction = ship.direction;
        
        if (coordinateX === squareX && coordinateY === squareY && direction === 'horizontal') {
          length = ship.length;
        }
      }

      const sendMovingLocation = (adjustmentNum) => {
        setMovingLocation(squareOnes[focusIndex]);
        cannotMove = setMovingLocation(squareOnes[focusIndex + adjustmentNum], list);

        if (!cannotMove) {
          focusIndex += adjustmentNum;
          addTabIndex(list);
          focusShip(list);

          const squareOnes = document.querySelectorAll('.square-one');
          squareOnes[focusIndex].focus();
        }
      }
      
      if (e.key === 'ArrowRight' && focusIndex % column + length + 1 <= column) {
        sendMovingLocation(1);
      } else if (e.key === 'ArrowLeft' && focusIndex % column !== 0) {
        sendMovingLocation(-1);
      } else if (e.key === 'ArrowDown' && focusIndex + column <= squareOnes.length - 1) {
        sendMovingLocation(column);
      }  else if (e.key === 'ArrowUp' && focusIndex - column >= 0) {
        sendMovingLocation(-column);
      }
    }
  };

  const deployRandom = (list) => {
    board = Array.from({ length: row }, () => Array(column).fill(0));
    
    for (let i = 0; i < list.length; i++) {
      const ship = list[i];
      const [bowX, bowY] = ship.coordinates[0];
      
      while (true) {
        const endX = Math.floor(Math.random() * row);
        const endY = Math.floor(Math.random() * column);
        
        const directions = ['horizontal', 'vertical'];
        const direction = directions[Math.floor(Math.random() * 2)];
        
        const cannotMove = moveShip(bowX, bowY, endX, endY, ship, direction);
        
        if (!cannotMove) {
          break;
        }
      }
    }
  };

  let currentMode = '';

  const markupTarget = (otherBoard) => {
    const squares = document.querySelectorAll('.square-two');
    const columns = document.querySelectorAll('.column');
    const rows = document.querySelectorAll('.row');

    const loseFocus = () => {
      columns.forEach((column) => column.classList.remove('target-line'));
      rows.forEach((row) => row.classList.remove('target-line'));
      squares.forEach((square) => {
        square.classList.remove('target');
        square.classList.remove('on-target');
      });
    };

    if (!otherBoard) {
      loseFocus();
      return;
    }

    squares.forEach((square) => {
      const x = Number(square.getAttribute('x'));
      const y = Number(square.getAttribute('y'));
      const squareOnBoard = otherBoard[x][y];

      square.addEventListener('mouseenter', () => {
        if (currentMode !== 'hover') {
          loseFocus();
        }

        currentMode = 'hover';

        squareIndex = x * column + y;
        square.focus();

        if (squareOnBoard === 0 || squareOnBoard === 'S') {
          columns[y].classList.add('target-line');
          rows[x].classList.add('target-line');
          square.classList.add('target');
          square.classList.add('on-target');
        }
      });

      square.addEventListener('focus', () => {
        if (currentMode !== 'focus') {
          loseFocus();
        }

        currentMode = 'focus';

        if (squareOnBoard === 0 || squareOnBoard === 'S') {
          columns[y].classList.add('target-line');
          rows[x].classList.add('target-line');
          square.classList.add('target');
          square.classList.add('on-target');
        }
      });

      square.addEventListener('mouseleave', () => loseFocus());
      square.addEventListener('blur', () => loseFocus());
    });
  };

  let squareIndex = -1;
  let onConfirmation;

  const focusWithArrowKey = (confirmation, board, e) => {
    if (confirmation === 'confirmation-on') {
      onConfirmation = true;
    } else if (confirmation === 'confirmation-off') {
      onConfirmation = false;
      return;
    }

    if (onConfirmation) {
      return;
    }

    const squareTwos = document.querySelectorAll('.square-two');

    // 1. Determine the step size based on the key pressed
    let step = 0;

    if (!e || e.key === 'ArrowRight') {
      step = 1;
    } else if (e.key === 'ArrowLeft') {
      step = -1;
    } else if (e.key === 'ArrowDown') {
      step = column;
    } else if (e.key === 'ArrowUp') {
      step = -column;
    }

    // 2. Move the index initially (if it was already initialized)
    if (squareIndex === -1) {
      squareIndex = 0;
    } else {
      squareIndex += step;
    }

    // Helper utility to safely wrap indices around the board boundaries
    const wrapIndex = (index, length) => {
      if (index >= length) {
        return index - length;
      }
      
      if (index < 0) {
        return index + length;
      }
      
      return index;
    };

    squareIndex = wrapIndex(squareIndex, squareTwos.length);

    // 3. Scan for obstacles using the INTENDED movement direction step
    for (let i = 0; i < row * column; i++) {
      const squareRow = Math.floor(squareIndex / column);
      const squareColumn = squareIndex % column;
      const currentSquare = board[squareRow][squareColumn];

      // Valid landing spot found! Stop scanning.
      if (currentSquare === 0 || currentSquare === 'S') {
        break;
      }

      // Hit an obstacle! Continue moving in the player's intended direction
      // If the original move was 'Up', it keeps skipping 'Up' (-column)
      // If the original move was 'Left', it keeps skipping 'Left' (-1)
      squareIndex = wrapIndex(squareIndex + step, squareTwos.length);
    }
    
    // Focus the verified valid square
    squareTwos[squareIndex].focus();
  };

  const splashOnBoard = (x, y, ship) => {
    // Put splash after hitting.
    if (board[x - 1]) {
      if (board[x - 1][y - 1] === 0) {
        board[x - 1][y - 1] = 2;
      }

      if (board[x - 1][y + 1] === 0) {
        board[x - 1][y + 1] = 2;
      }
    }

    if (board[x + 1]) {
      if (board[x + 1][y - 1] === 0) {
        board[x + 1][y - 1] = 2;
      }

      if (board[x + 1][y + 1] === 0) {
        board[x + 1][y + 1] = 2;
      }
    }

    if (ship) {
      // Put splash after sinking.
      const sunkCoordinates = [];

      for (let i = 0; i < ship.length; i++) {
        const [coordinateX, coordinateY] = ship.coordinates[i];
        sunkCoordinates.push([coordinateX, coordinateY]);

        if (board[coordinateX - 1]) {
          if (board[coordinateX - 1][coordinateY] === 0) {
            board[coordinateX - 1][coordinateY] = 2;
          }
        }

        if (board[coordinateX][coordinateY - 1] === 0) {
          board[coordinateX][coordinateY - 1] = 2;
        }
      
        if (board[coordinateX][coordinateY + 1] === 0) {
          board[coordinateX][coordinateY + 1] = 2;
        }

        if (board[coordinateX + 1]) {
          if (board[coordinateX + 1][coordinateY] === 0) {
            board[coordinateX + 1][coordinateY] = 2;
          }
        }
      }

      return sunkCoordinates;
    }
  }

  const receiveAttack = (x, y, playerNo, list, otherBoard) => {
    const square = board[x][y];
    let result = '';
    let sunkCoordinates = [];
    let length = 0;
    
    if (square === 0) {
      result = 'miss';
      board[x][y] = 1;
    } else if (square !== 'S') {
      return;
    } else {
      for (let i = 0; i < list.length; i++) {
        const ship = list[i];
        
        for (let j = 0; j < ship.length; j++) {
          const [coordinateX, coordinateY] = ship.coordinates[j];
          
          if (coordinateX === x && coordinateY === y) {
            result = 'hit';
            ship.hit(ship);
            board[x][y] = 'X';
            length = ship.length;

            const wrapper = document.querySelector('.wrapper');

            if (playerNo === 1) {
              wrapper.classList.add('hit-one');

              setTimeout(() => {
                wrapper.classList.remove('hit-one');
              }, 150);
            } else {
              wrapper.classList.add('hit-two');

              setTimeout(() => {
                wrapper.classList.remove('hit-two');
              }, 150);
            }

            const sinking = ship.isSunk(ship);

            if (!sinking) {
              splashOnBoard(x, y);
            } else {
              result = 'sunk';
              sunkCoordinates = splashOnBoard(x, y, ship);
            }
          }
        }
      }
    }

    const game = GameController();
    const shipType = ['submarine', 'destroyer', 'cruiser', 'battleship'];

    if (result === 'hit') {
      if (playerNo === 2) {
        game.updateMessage('Hit!');
      } else {
        game.updateMessage('Ouch!');
      }
    } else if (result === 'sunk') {
      if (playerNo === 2) {
        game.updateMessage('Got ' + shipType[length - 1] + '!');
      } else {
        game.updateMessage('Lost ' + shipType[length - 1] + '!');
      }
    }
    
    renderBoard(playerNo, otherBoard, sunkCoordinates);
    return result;
  };

  const getComputerMove = (waitComputerMove, list, otherBoard) => {
    const adjacentSquares = [];
    const restSquares = [];
    // Check if there is a damaged enemy ship.
    for (let i = 0; i < row; i++) {
      const squareRow = board[i];

      for (let j = 0; j < column; j++) {
        const square = squareRow[j];

        if (square === 'X') {
          if (board[i - 1]) {
            if (board[i - 1][j] === 0 || board[i - 1][j] === 'S') {
              adjacentSquares.push((i - 1) * column + j);
            }
          }
          
          if (board[i][j - 1] === 0 || board[i][j - 1] === 'S') {
            adjacentSquares.push(i * column + j - 1);
          }
          
          if (board[i][j + 1] === 0 || board[i][j + 1] === 'S') {
            adjacentSquares.push(i * column + j + 1);
          }
          
          if (board[i + 1]) {
            if (board[i + 1][j] === 0 || board[i + 1][j] === 'S') {
              adjacentSquares.push((i + 1) * column + j);
            }
          }
        } else if (square === 0 || square === 'S') {
          const restSquare = i * column + j;
          restSquares.push(restSquare);
        }
      }
    }
    
    let randomIndex = Math.floor(Math.random() * restSquares.length);
    let targetSquare = restSquares[randomIndex];
    
    if (adjacentSquares.length !== 0) {
      randomIndex = Math.floor(Math.random() * adjacentSquares.length);
      targetSquare = adjacentSquares[randomIndex];
    }

    const x = Math.floor(targetSquare / column);
    const y = targetSquare % column;
    
    setTimeout(() => {
      const result = receiveAttack(x, y, 1, list, otherBoard);
      
      if (result === 'hit') {
        getComputerMove(waitComputerMove, list, otherBoard);
      } else if (result === 'sunk') {
        setTimeout(() => {
          const winner = checkTheWinner(1, list);

          if (winner) {
            waitComputerMove(winner);
          } else {
            getComputerMove(waitComputerMove, list, otherBoard);
          }
        }, 1000);
      } else {
        waitComputerMove();
      }
    }, 1000);
  };

  const checkTheWinner = (playerNo, list) => {
    const sunkCounter = list.reduce((acc, curr, i) => acc + curr.isSunk(list[i]), 0);
        
    if (sunkCounter === list.length) {
      return playerNo;
    }
  };
  
  const getBoard = () => board;

  const addTabIndex = (list, x, y) => {
    const squareOnes = document.querySelectorAll('.square-one');

    for (let i = 0; i < list.length; i++) {
      const bow = list[i].coordinates[0];
      const bowX = bow[0];
      const bowY = bow[1];
      const index = bowX * column + bowY;
      squareOnes[index].setAttribute('tabindex', '0');
    }
    // Add focus after rotating a ship.
    if (x >= 0) {
      const index = x * column + y;
      focusShip(list);
      squareOnes[index].focus();
    }
  };

  const renderBoard = (playerNo, otherBoard, sunkCoordinates, currentVictory) => {
    const boardContainerOne = document.querySelector('.board-container-one');
    const boardContainerTwo = document.querySelector('.board-container-two');
    boardContainerOne.innerHTML = '';
    boardContainerTwo.innerHTML = '';

    if (!playerNo) {
      boardContainerTwo.classList.remove('dark');
    }
    
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

        if (playerNo === 2) {
          if (otherBoard[i][j] === 1) {
            squareOne.classList.add('miss-one');
          } else if (otherBoard[i][j] === 2) {
            squareOne.classList.add('splash-one');
          } else if (otherBoard[i][j] === 'X') {
            squareOne.classList.add('hit-one');
          }  else if (otherBoard[i][j] === 'D') {
            squareOne.classList.add('hit-one');
            squareOne.classList.add('sunk-one');
          } else if (otherBoard[i][j] === 'S') {
            squareOne.classList.add('ship');
            squareOne.setAttribute('draggable', 'false');
          }

          if (board[i][j] === 1) {
            squareTwo.classList.add('miss-two');
          } else if (board[i][j] === 2) {
            squareTwo.classList.add('splash-two');
          } else if (board[i][j] === 'X') {
            squareTwo.classList.add('hit-two');
          } else if (board[i][j] === 'D') {
            squareTwo.classList.add('hit-two');
            squareTwo.classList.add('sunk-two');
          } else {
            squareTwo.setAttribute('tabindex', '0');
          }
        } else {
          if (board[i][j] === 'S') {
            squareOne.classList.add('ship');
            squareOne.setAttribute('draggable', 'false');

            if (!playerNo) {
              squareOne.setAttribute('draggable', 'true');
              squareOne.classList.add('grabbing');
            }
          }

          if (!playerNo) {
            squareTwo.classList.add('initial');
          } else {
            if (board[i][j] === 1) {
              squareOne.classList.add('miss-one');
            } else if (board[i][j] === 2) {
              squareOne.classList.add('splash-one');
            } else if (board[i][j] === 'X') {
              squareOne.classList.add('hit-one');
            } else if (board[i][j] === 'D') {
              squareOne.classList.add('hit-one');
              squareOne.classList.add('sunk-one');
            }

            if (otherBoard[i][j] === 1) {
              squareTwo.classList.add('miss-two');
            } else if (otherBoard[i][j] === 2) {
              squareTwo.classList.add('splash-two');
            } else if (otherBoard[i][j] === 'X') {
              squareTwo.classList.add('hit-two');
            } else if (otherBoard[i][j] === 'D') {
              squareTwo.classList.add('hit-two');
              squareTwo.classList.add('sunk-two');
            } else {
              squareTwo.setAttribute('tabindex', '0');
            }
          }
        }

        boardContainerOne.appendChild(squareOne);
        boardContainerTwo.appendChild(squareTwo);
      }
    }

    if (sunkCoordinates) {
      const squareOnes = document.querySelectorAll('.square-one');
      const squareTwos = document.querySelectorAll('.square-two');

      for (let i = 0; i < sunkCoordinates.length; i++) {
        const coordinates = sunkCoordinates[i];
        const coordinateX = coordinates[0];
        const coordinateY = coordinates[1];
        board[coordinateX][coordinateY] = 'D';
        
        if (playerNo === 2) {
          squareTwos[coordinateX * column + coordinateY].classList.add('sunk-transition');
        } else {
          squareOnes[coordinateX * column + coordinateY].classList.add('sunk-transition');
        }
      }

      setTimeout(() => {
        for (let i = 0; i < sunkCoordinates.length; i++) {
          const coordinates = sunkCoordinates[i];
          const coordinateX = coordinates[0];
          const coordinateY = coordinates[1];

          if (playerNo === 2) {
            squareTwos[coordinateX * column + coordinateY].classList.add('sunk-two');
          } else {
            squareOnes[coordinateX * column + coordinateY].classList.add('sunk-one');
          }
        }
      }, 500);
    }

    if (!playerNo) {
      boardContainerOne.classList.add('deploy-time');

      const rows = document.querySelectorAll('.row');
      const columns = document.querySelectorAll('.column');
      const link = document.querySelector('.link');

      rows.forEach((row) => {
        row.classList.remove('dark');
        row.classList.add('initial-line');
      });

      columns.forEach((column) => {
        column.classList.remove('dark');
        column.classList.add('initial-line');
      });
      
      link.classList.remove('dark');
      link.classList.add('initial-link');
    }

    if (currentVictory >= 0) {
      const roundBoard = document.querySelector('.round-board');
      const round = currentVictory + 1;
      
      roundBoard.classList.remove('erase-round');
      roundBoard.classList.add('display-round');
      roundBoard.textContent = 'Round ' + round;

      setTimeout(() => {
        roundBoard.textContent = 'Fight!';

        setTimeout(() => {
          roundBoard.classList.remove('display-round');
          roundBoard.classList.add('erase-round');
        }, 500);
      }, 1500);

      boardContainerOne.classList.remove('deploy-time');

      const rows = document.querySelectorAll('.row');
      const columns = document.querySelectorAll('.column');
      const link = document.querySelector('.link');

      rows.forEach((row) => row.classList.remove('initial-line'));
      columns.forEach((column) => column.classList.remove('initial-line'));
      link.classList.remove('initial-link');
    }
  };
  
  return {
    deployBoard,
    hoverShip,
    focusShip,
    rotateShip,
    setMovingLocation,
    moveWithArrowKey,
    deployRandom,
    markupTarget,
    focusWithArrowKey,
    receiveAttack,
    getComputerMove,
    checkTheWinner,
    getBoard,
    addTabIndex,
    renderBoard,
  };
}

function GameController() {
  const randomBtn = document.querySelector('.random-btn');
  const playBtn = document.querySelector('.play-btn');

  const setUpGame = (playerOne, playerTwo) => {
    const customSet = playerOne.ship.getDeploySet(playerOne);

    playerOne.ship.deployShip(customSet);
    playerTwo.ship.deployShip();
    playerOne.board.deployBoard(playerOne.ship.getList());
    playerTwo.board.deployBoard(playerTwo.ship.getList());
    playerTwo.board.deployRandom(playerTwo.ship.getList());
    setCurrentTurn(playerOne, 0);
    updateRecords(playerOne);
    updateMessage('deploy');
    updateBtn(playerOne.currentTurn);
    playerOne.board.renderBoard();
    playerOne.board.addTabIndex(playerOne.ship.getList());

    if (playerOne.finishedGame) {
      setFinished();
    }
  }

  const setCurrentTurn = (playerOne, turn) => playerOne.currentTurn = turn;

  const updateRecords = (playerOne, score, notRender) => {
    if (score === 'hit') {
      playerOne.currentScore += 500;
    } else if (score === 'reset') {
      playerOne.currentScore = 0;
      playerOne.currentVictory = 0;
    } else if (score) {
      playerOne.currentScore += score;
      playerOne.currentVictory += 1;
    }

    if (playerOne.currentScore > playerOne.hiScore) {
      playerOne.hiScore = playerOne.currentScore;
      localStorage.setItem('hiScore', JSON.stringify(playerOne.hiScore));
    }

    if (playerOne.currentVictory > playerOne.highestVictory) {
      playerOne.highestVictory = playerOne.currentVictory;
      localStorage.setItem('highestVictory', JSON.stringify(playerOne.highestVictory));
    }
    
    if (notRender) {
      return;
    }

    const currentScoreBoard = document.querySelector('.current-score-board');
    const hiScoreBoard = document.querySelector('.hi-score-board');
    const currentVictoryBoard = document.querySelector('.current-victory-board');
    const highestVictoryBoard = document.querySelector('.highest-victory-board');
    let padScore = playerOne.currentScore.toString().padStart(6, '0');
    let padHiScore = playerOne.hiScore.toString().padStart(6, '0');

    currentScoreBoard.textContent = padScore;
    hiScoreBoard.textContent = 'Hi ' + padHiScore;
    currentVictoryBoard.textContent = playerOne.currentVictory;
    highestVictoryBoard.textContent = playerOne.highestVictory;
  };

  let intervalId = 0;

  const updateMessage = (message) => {
    const messageBoard = document.querySelector('.message-board');

    if (message === 'deploy') {
      let counter = 0;
      messageBoard.textContent = 'Deploy your fleet';

      intervalId = setInterval(() => {
        counter += 1;

        if (counter === 0) {
          messageBoard.textContent = 'Deploy your fleet';
        } else if (counter === 1) {
          messageBoard.textContent = 'Drag to move';
        } else if (counter === 2) {
          messageBoard.textContent = 'Click to rotate';
        } else if (counter === 3) {
          messageBoard.textContent = 'Keyboard usable';
        } else if (counter === 4) {
          messageBoard.textContent = 'Tab to choose';
        } else if (counter === 5) {
          messageBoard.textContent = 'Arrows to move';
        } else if (counter === 6) {
          messageBoard.textContent = 'Space to rotate';
        } else if (counter === 7) {
          messageBoard.textContent = 'R to Random';
        } else if (counter === 8) {
          messageBoard.textContent = 'P to Play';
        }

        if (counter === 8) {
          counter = -1;
        }
      }, 2000);
    } else if (message === 'start') {
      clearInterval(intervalId);
      messageBoard.textContent = 'Good luck!';

      setTimeout(() => {
        messageBoard.textContent = 'Your turn';
      }, 1500);
    } else {
      messageBoard.textContent = message;
    }
  };

  const addHoverOnShip = (playerOne) => {
    const currentTurn = playerOne.currentTurn;

    if (currentTurn === 0) {
      playerOne.board.hoverShip(playerOne.ship.getList());
    }
  }

  const sendRotatingLocation = (e, playerOne) => {
    if (e instanceof KeyboardEvent) {
      if (e.key !== 'Enter' && e.key !== ' ') {
        return;
      }
    }

    const currentTurn = playerOne.currentTurn;
    
    if (currentTurn === 0 && e.target.classList.contains('ship')) {
      const x = Number(e.target.getAttribute('x'));
      const y = Number(e.target.getAttribute('y'));
      playerOne.board.rotateShip(x, y, playerOne.ship.getList(), e);
      playerOne.board.addTabIndex(playerOne.ship.getList(), x, y);
    }
  }

  const preventDefault = (e, playerOne) => {
    const currentTurn = playerOne.currentTurn;

    if (currentTurn === 0) {
      e.preventDefault();
    }
  }

  const updateBtn = (currentTurn) => {
    const randomBtn = document.querySelector('.random-btn');
    const playBtn = document.querySelector('.play-btn');

    if (currentTurn === 0) {
      randomBtn.textContent = 'Random';
      randomBtn.classList.remove('reset-btn');
      playBtn.classList.remove('disabled');
    } else {
      randomBtn.textContent = 'Reset';
      randomBtn.classList.add('reset-btn');
      playBtn.classList.remove('play-btn-hover');
      playBtn.classList.add('disabled');
    }
  };

  const handleResetConfirmation = (e, playerOne, playerTwo) => {
    if (e instanceof KeyboardEvent) {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab'].includes(e.key)) {
        e.preventDefault();
        const cancelBtn = document.querySelector('.cancel-btn');
        cancelBtn.focus();
      }
    } else {
      playerOne.board.focusWithArrowKey('confirmation-off');
      updateRecords(playerOne, 'reset');
      setUpGame(playerOne, playerTwo);
    }
  }

  const handleResetCancellation = (e, playerOne, playerTwo) => {
    if (e instanceof KeyboardEvent) {
      if(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab'].includes(e.key)) {
        e.preventDefault();
        const doResetBtn = document.querySelector('.do-reset-btn');
        doResetBtn.focus();
      }
    } else {
      playerOne.board.focusWithArrowKey('confirmation-off');
      playerOne.board.renderBoard(1, playerTwo.board.getBoard());
      playerOne.board.markupTarget(playerTwo.board.getBoard());
    }
  }

  const randomOrReset = (e, playerOne, playerTwo) => {
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
      openResetDialog(playerOne, playerTwo);
    }
  }

  const openResetDialog = (playerOne, playerTwo) => {
    const boardContainerOne = document.querySelector('.board-container-one');

    const confirmationHTML = `
      <div class="confirmation-container">
        <h2 class="dialog-header">Are you sure to reset?</h2>
        <div class="btn-container">
          <button type="button" class="cancel-btn">Cancel</button>
          <button type="button" class="do-reset-btn">Reset</button>
        </div>
      </div>
    `;

    boardContainerOne.innerHTML = confirmationHTML;

    const doResetBtn = document.querySelector('.do-reset-btn');
    const cancelBtn = document.querySelector('.cancel-btn');

    doResetBtn.addEventListener('click', (e) => handleResetConfirmation(e, playerOne, playerTwo));
    doResetBtn.addEventListener('keydown', (e) => handleResetConfirmation(e, playerOne, playerTwo));
      
    cancelBtn.addEventListener('click', (e) => handleResetCancellation(e, playerOne, playerTwo));
    cancelBtn.addEventListener('keydown', (e) => handleResetCancellation(e, playerOne, playerTwo));

    cancelBtn.focus();
  };

  const focusRandomBtn = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      randomBtn.focus();
    }
  }

  const addHoverOnPlayBtn = (playerOne) => {
    const currentTurn = playerOne.currentTurn;

    if (currentTurn === 0) {
      playBtn.classList.add('play-btn-hover');
    }
  }

  const removeHoverOnPlayBtn = (playerOne) => {
    const currentTurn = playerOne.currentTurn;

    if (currentTurn === 0) {
      playBtn.classList.remove('play-btn-hover');
    }
  }

  const startGame = (playerOne, playerTwo) => {
    const currentTurn = playerOne.currentTurn;
    
    if (currentTurn === 0) {
      const currentVictory = playerOne.currentVictory;

      setCurrentTurn(playerOne, 1);
      updateMessage('start');
      updateBtn(playerOne.currentTurn);
      playerOne.board.renderBoard(1, playerTwo.board.getBoard(), '', currentVictory);
      playerOne.board.markupTarget(playerTwo.board.getBoard());
    }
  }

  const handleGame = (e, playerOne, playerTwo) => {
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
        updateRecords(playerOne, 'hit');
        const winner = playerTwo.board.checkTheWinner(1, playerTwo.ship.getList());

        if (winner) {
          handleGameOver(playerOne, playerTwo);
        } else {
          playerOne.board.markupTarget(playerTwo.board.getBoard());
        }
      } else if (result === 'miss') {
        executeComputerTurn(e, playerOne, playerTwo);
      }
    }
  }

  const executeComputerTurn = ((e, playerOne, playerTwo) => {
    // Callback for setTimeout.
    const waitComputerMove = (winner) => {
      if (winner) {
        // Callback for setTimeout.
        const waitRender = () => {
          const tryAgainBtn = document.querySelector('.try-again-btn');
          tryAgainBtn.focus();

          const tryAgain = (e) => {
            if (e instanceof KeyboardEvent) {
              if (e.key !== 'Enter' && e.key !==' ') {
                return;
              }
            }

            updateRecords(playerOne, 'reset');
            setUpGame(playerOne, playerTwo);
          }
          
          tryAgainBtn.addEventListener('click', tryAgain);
          tryAgainBtn.addEventListener('keydown', tryAgain);
        }

        setCurrentTurn(playerOne, 3);
        displayResult(2, waitRender, '', playerOne.currentVictory);
      } else {
        setCurrentTurn(playerOne, 1);
        updateMessage('Your turn');
        playerOne.board.markupTarget(playerTwo.board.getBoard());

        if (e instanceof KeyboardEvent) {
          playerOne.board.focusWithArrowKey('', playerTwo.board.getBoard());
        }
      }
    }

    setCurrentTurn(playerOne, 2);
    updateMessage('Computer\'s turn');
    playerOne.board.markupTarget();
    playerOne.board.getComputerMove(waitComputerMove, playerOne.ship.getList(), playerTwo.board.getBoard());
  });

  const handleGameOver = ((playerOne, playerTwo) => {
    // Callback for setTimeout.
    const waitRender = (totalBonus) => {
      updateRecords(playerOne, totalBonus, 'notRender');
      rotateEmblem();
      
      const moveOnBtn = document.querySelector('.move-on-btn');
      moveOnBtn.focus();

      const moveOn = (e) => {
        if (e instanceof KeyboardEvent) {
          if (e.key !== 'Enter' && e.key !==' ') {
            return;
          }
        }
        
        const boardContainerOne = document.querySelector('.board-container-one');
        boardContainerOne.classList.remove('erase-board', 'display-board');
        rotateEmblem();
        const currentVictory = playerOne.currentVictory;
        
        if (currentVictory === 20) {
          displayResult('finish');
          updateRecords(playerOne);

          const finaleBtn = document.querySelector('.finale-btn');
          finaleBtn.focus();

          const finale = (e) => {
            if (e instanceof KeyboardEvent) {
              if (e.key !== 'Enter' && e.key !==' ') {
                return;
              }
            }

            rotateEmblem();
            updateRecords(playerOne, 'reset');
            setFinished(playerOne);
            setUpGame(playerOne, playerTwo);
          }

          finaleBtn.addEventListener('click', finale);
          finaleBtn.addEventListener('keydown', finale);
        } else {
          setUpGame(playerOne, playerTwo);
        }
      }

      moveOnBtn.addEventListener('click', moveOn);
      moveOnBtn.addEventListener('keydown', moveOn);
    }

    setCurrentTurn(playerOne, 3);
    playerOne.board.markupTarget();
    displayResult(1, waitRender, playerOne.ship.getList());
  });

  const rotateEmblem = () => {
    const emblems = document.querySelectorAll('.emblem');

    emblems.forEach((emblem) => {
      emblem.classList.add('rotate-emblem');

      setTimeout(() => {
        emblem.classList.remove('rotate-emblem');
      }, 1000);
    });
  };

  const getTotalBonus = (list) => {
    const bonusScoreBoards = document.querySelectorAll('.bonus-score-board');
    const totalBonusScoreBoard = document.querySelector('.total-bonus-score-board');
    let totalBonus = 0;

    bonusScoreBoards.forEach((bonusScoreBoard, i) => {
      let bonus = 2000 - i * 500;
      
      if (!list[i].isSunk(list[i])) {
        totalBonus += bonus;
      } else {
        bonus = 0;
      }

      bonusScoreBoard.textContent = bonus;
    });

    totalBonusScoreBoard.textContent = totalBonus;
    return totalBonus;
  };

  const displayResult = (playerNo, waitRender, list, currentVictory) => {
    const boardContainerOne = document.querySelector('.board-container-one');
    const boardContainerTwo = document.querySelector('.board-container-two');
    let resultHTML = '';

    if (playerNo === 1) {
      resultHTML = `
        <div class="victory-container">
          <h2 class="dialog-header">Mission Complete</h2>
          <p class="alive-bonus">- Alive Bonus -</p>
          <div class="bonus-row">
            <p>Battleship</p>
            <p class="bonus-score-board"></p>
          </div>
          <div class="bonus-row">
            <p>Cruiser</p>
            <p class="bonus-score-board"></p>
          </div>
          <div class="bonus-row">
            <p>Destroyer</p>
            <p class="bonus-score-board"></p>
          </div>
          <div class="bonus-row">
            <p>Submarine</p>
            <p class="bonus-score-board"></p>
          </div>
          <div class="bonus-row total-bonus-row">
            <p>Total Bonus</p>
            <p class="total-bonus-score-board"></p>
          </div>
          <button type="button" class="move-on-btn">Move on</button>
        </div>
      `;

      const sunkCounter = list.reduce((acc, curr, i) => acc + curr.isSunk(list[i]), 0);
      
      setTimeout(() => {
        if (sunkCounter === 0) {
          updateMessage('You win! Perfect');
        } else {
          updateMessage('You win!');
        }
        
        boardContainerOne.innerHTML = resultHTML;
        const totalBonus = getTotalBonus(list);
        waitRender(totalBonus);
      }, 2000);
    } else if (playerNo === 2) {
      resultHTML = `
        <div class="defeat-container">
          <h2 class="dialog-header">Mission failed</h2>
          <p>- Battle Result -</p>
          <p class="final-victory-board"></p>
          <p>Your rank:</p>
          <p class="rank-board"></p>
          <p class="comment">Good luck next time.</p>
          <button type="button" class="try-again-btn">Try again</button>
        </div>
      `;

      setTimeout(() => {
        updateMessage('You lose');
        boardContainerTwo.classList.add('dark');
        
        const rows = document.querySelectorAll('.row');
        const columns = document.querySelectorAll('.column');
        rows.forEach((row) => row.classList.add('dark'));
        columns.forEach((column) => column.classList.add('dark'));

        const link = document.querySelector('.link');
        link.classList.add('dark');
        boardContainerOne.innerHTML = resultHTML;

        const rankList = ['Seaman', 'Petty Officer', 'Chief Petty Officer', 'Ensign', 'Lieutenant Jr. Grade', 'Lieutenant', 'Lieutenant Commander', 'Commander', 'Captain', 'Rear Admiral', 'Vice Admiral'];
        let rankIndex = Math.floor(currentVictory / 2) + 1;
        
        if (currentVictory === 0) {
          rankIndex = 0;
        }

        const finalVictoryBoard = document.querySelector('.final-victory-board');
        const rankBoard = document.querySelector('.rank-board');
        finalVictoryBoard.textContent = currentVictory + ' wins';
        rankBoard.textContent = rankList[rankIndex];
        waitRender();
      }, 1000);
    } else {
      updateMessage('You win!');
      
      resultHTML = `
        <div class="finish-container">
          <h2 class="dialog-header">Congratulations!</h2>
          <p>- Battle Result -</p>
          <p>20 wins</p>
          <p>Your rank:</p>
          <p class="rank-board">Admiral</p>
          <p class="comment">Honor your achievement!</p>
          <button type="button" class="finale-btn">Finale</button>
        </div>
      `;

      boardContainerOne.innerHTML = resultHTML;
    }
  };

  const setFinished = (playerOne) => {
    if (playerOne) {
      playerOne.finishedGame = true;
    } else {
      const title = document.querySelector('.title');
      title.classList.add('golden-title');
    }
  };

  const handleKeyDown = (e, playerOne, playerTwo) => {
    const currentTurn = playerOne.currentTurn;

    if (currentTurn === 0) {
      const currentFocus = document.activeElement;

      if (currentFocus === document.body) {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
          randomBtn.focus();
          return;
        }
      }

      if (e.key === 'Tab') {
        playerOne.board.focusShip(playerOne.ship.getList());
      }

      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab'].includes(e.key)) {
        playerOne.board.moveWithArrowKey(e, playerOne.ship.getList());
      }
    } else if (currentTurn === 1) {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        playerOne.board.focusWithArrowKey('', playerTwo.board.getBoard(), e);
      }
    } else if (currentTurn === 3) {
      e.preventDefault();
      return;
    }

  if (e.key === 'r') {
      randomOrReset('', playerOne, playerTwo);
    } else if (e.key === 'p') {
      startGame(playerOne, playerTwo);
    }
  }

  return {
    setUpGame,
    updateMessage,
    addHoverOnShip,
    sendRotatingLocation,
    preventDefault,
    randomOrReset,
    addHoverOnPlayBtn,
    removeHoverOnPlayBtn,
    focusRandomBtn,
    startGame,
    handleGame,
    handleKeyDown,
  }
}

export function createPlayer({
  playerNo,
  playerType,
  currentTurn,
  currentScore,
  hiScore,
  currentVictory,
  highestVictory,
  finishedGame,
  customSet,
}) {
  return {
    playerNo,
    playerType,
    currentTurn,
    currentScore,
    hiScore,
    currentVictory,
    highestVictory,
    finishedGame,
    customSet,
    ship: Ship(),
    board: GameBoard(),
    game: GameController(),
  };
}
