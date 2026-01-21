function shipList() {
  const list = [];

  function ship(length, direction, bowX, bowY) {
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

  const deployShip = (customSets) => {
    const defaultSets = [[0, 1, 4, 'horizontal'], [5, 3, 3, 'vertical'], [3, 6, 2, 'horizontal'], [6, 1, 1, 'vertical']];
    let fleetSets = [];
    customSets ? fleetSets = customSets : fleetSets = defaultSets;
    
    for (let i = 0; i < fleetSets.length; i++) {
      const fleetSet = fleetSets[i];
      const bowX = fleetSet[0];
      const bowY = fleetSet[1];
      const length = fleetSet[2];
      const direction = fleetSet[3];
      const newShip = ship(length, direction, bowX, bowY);
      list.push(newShip);
    }
  };

  const getDeploySets = () => {
    const customSets = [];
    
    for (let i = 0; i < list.length; i++) {
      const ship = list[i];
      const x = ship.coordinates[0][0];
      const y = ship.coordinates[0][1];
      const length = ship.length;
      const direction = ship.direction;
      const customSet = [x, y, length, direction];
      customSets.push(customSet);
    }

    return customSets;
  };

  const getList = () => list;

  return {
    deployShip,
    getDeploySets,
    getList,
  }
}

function gameBoard() {
  const row = 8;
  const column = 8;
  let board = Array.from({ length: row }, () => Array(column).fill(0));
  
  const deployBoard = (list) => {
    for (let i = 0; i < list.length; i++) {
      const ship = list[i];
      const length = ship.length;
      const direction = ship.direction;
      const bow = ship.coordinates[0];
      const bowX = bow[0];
      const bowY = bow[1];
    
      for (let j = 0; j < length; j++) {
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

  const rotateShip = (x, y, list) => {
    for (let i = 0; i < list.length; i++) {
      const ship = list[i];
      const length = ship.length;

      if (length === 1) {
        return;
      }

      for (let j = 0; j < length; j++) {
        let coordinates = ship.coordinates[j];
        let coordinateX = coordinates[0];
        let coordinateY = coordinates[1];
        
        if (x === coordinateX && y === coordinateY) {
          const direction = ship.direction;
          const bow = ship.coordinates[0];
          const bowX = bow[0];
          const bowY = bow[1];
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
              coordinates = ship.coordinates[k];
              coordinateX = coordinates[0];
              coordinateY = coordinates[1];
              
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

  function moveShip(x, y, x2, y2, ship, randomDirection) {
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

  const setMoveLocation = (target, list) => {
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
        const coordinates = ship.coordinates[j];
        const coordinateX = coordinates[0];
        const coordinateY = coordinates[1];
        const startX = Number(startTarget.getAttribute('x'));
        const startY = Number(startTarget.getAttribute('Y'));

        if (coordinateX === startX && coordinateY === startY) {
          const direction = ship.direction;
          const bow = ship.coordinates[0];
          const bowX = bow[0];
          const bowY = bow[1];
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
            startTarget.classList.add('caution');
            
            setTimeout(() => {
              startTarget.classList.remove('caution');
            }, 200);
          } else {
            renderBoard();
          }
        }
      }
    }
  };

  const deployRandom = (list) => {
    board = Array.from({ length: row }, () => Array(column).fill(0));

    for (let i = 0; i < list.length; i++) {
      const ship = list[i];
      const bow = ship.coordinates[0];
      const bowX = bow[0];
      const bowY = bow[1];
      
      function getRandomLocation() {
        const endX = Math.floor(Math.random() * row);
        const endY = Math.floor(Math.random() * column);
        const directions = ['horizontal', 'vertical'];
        const randomIndex = Math.floor(Math.random() * 2);
        const direction = directions[randomIndex];
        const cannotMove = moveShip(bowX, bowY, endX, endY, ship, direction);
        ship.direction = direction;
        // Run repeatedly until getting proper location.
        if (cannotMove) {
          getRandomLocation();
        }
      }
      
      getRandomLocation();
    }
  };

  const markupTarget = (otherBoard) => {
    const squares = document.querySelectorAll('.square-two');
    const columns = document.querySelectorAll('.column');
    const rows = document.querySelectorAll('.row');

    squares.forEach((square) => {
      if (!otherBoard) {
        columns.forEach((column) => {
          column.classList.remove('target-line');
        });

        rows.forEach((row) => {
          row.classList.remove('target-line');
        });

        return;
      }

      square.addEventListener('mouseenter', () => {
        const x = Number(square.getAttribute('x'));
        const y = Number(square.getAttribute('y'));
        const boardSquare = otherBoard[x][y];
        
        columns.forEach((column, i) => {
          if (y === i) {
            if (boardSquare === 0 || boardSquare === 'S') {
              column.classList.add('target-line');
            }
          }
        });

        rows.forEach((row, i) => {
          if (x === i) {
            if (boardSquare === 0 || boardSquare === 'S') {
              row.classList.add('target-line');
            }
          }
        });

        square.classList.add('target');
        square.classList.add('on-target');
      });

      square.addEventListener('mouseleave', () => {
        const x = Number(square.getAttribute('x'));
        const y = Number(square.getAttribute('y'));
        
        columns.forEach((column, i) => {
          if (y === i) {
            column.classList.remove('target-line');
          }
        });

        rows.forEach((row, i) => {
          if (x === i) {
            row.classList.remove('target-line');
          }
        });
        
        square.classList.remove('target');
        square.classList.remove('on-target');
      });
    });
  };

  function splashOnBoard(x, y, ship) {
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
        const coordinates = ship.coordinates[i];
        const coordinateX = coordinates[0];
        const coordinateY = coordinates[1];
        sunkCoordinates.push(coordinates);

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
          const coordinates = ship.coordinates[j];
          const coordinateX = coordinates[0];
          const coordinateY = coordinates[1];
          
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
              }, 100);
            } else {
              wrapper.classList.add('hit-two');

              setTimeout(() => {
                wrapper.classList.remove('hit-two');
              }, 100);
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

    const info = gameInfo();
    const shipType = ['submarine', 'destroyer', 'cruiser', 'battleship'];

    if (result === 'hit') {
      if (playerNo === 2) {
        info.updateMessage('Hit!');
      } else {
        info.updateMessage('Ouch!');
      }
    } else if (result === 'sunk') {
      if (playerNo === 2) {
        info.updateMessage('Got ' + shipType[length - 1] + '!');
      } else {
        info.updateMessage('Lost ' + shipType[length - 1] + '!');
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
              adjacentSquares.push((i - 1) * row + j);
            }
          }
          
          if (board[i][j - 1] === 0 || board[i][j - 1] === 'S') {
            adjacentSquares.push(i * row + j - 1);
          }
          
          if (board[i][j + 1] === 0 || board[i][j + 1] === 'S') {
            adjacentSquares.push(i * row + j + 1);
          }
          
          if (board[i + 1]) {
            if (board[i + 1][j] === 0 || board[i + 1][j] === 'S') {
              adjacentSquares.push((i + 1) * row + j);
            }
          }
        } else if (square === 0 || square === 'S') {
          const restSquare = i * row + j;
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

    const x = Math.floor(targetSquare / row);
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
          squareTwos[coordinateX * row + coordinateY].classList.add('sunk-transition');
        } else {
          squareOnes[coordinateX * row + coordinateY].classList.add('sunk-transition');
        }
      }

      setTimeout(() => {
        for (let i = 0; i < sunkCoordinates.length; i++) {
          const coordinates = sunkCoordinates[i];
          const coordinateX = coordinates[0];
          const coordinateY = coordinates[1];

          if (playerNo === 2) {
            squareTwos[coordinateX * row + coordinateY].classList.add('sunk-two');
          } else {
            squareOnes[coordinateX * row + coordinateY].classList.add('sunk-one');
          }
        }
      }, 500);
    }

    if (!playerNo) {
      boardContainerOne.classList.add('deploy-section');

      const rows = document.querySelectorAll('.row');
      const columns = document.querySelectorAll('.column');

      rows.forEach((row) => {
        row.classList.add('initial-line');
        row.classList.remove('dark');
      });

      columns.forEach((column) => {
        column.classList.add('initial-line');
        column.classList.remove('dark');
      });

      const adminLink = document.querySelector('.admin-link');
      adminLink.classList.add('initial-admin-link');
      adminLink.classList.remove('dark');
    }

    if (currentVictory || currentVictory === 0) {
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

      boardContainerOne.classList.remove('deploy-section');

      const rows = document.querySelectorAll('.row');
      const columns = document.querySelectorAll('.column');

      rows.forEach((row) => {
        row.classList.remove('initial-line');
      });

      columns.forEach((column) => {
        column.classList.remove('initial-line');
      });

      const adminLink = document.querySelector('.admin-link');
      adminLink.classList.remove('initial-admin-link');
    }
  };
  
  return {
    deployBoard,
    rotateShip,
    setMoveLocation,
    deployRandom,
    markupTarget,
    receiveAttack,
    getComputerMove,
    checkTheWinner,
    getBoard,
    renderBoard,
  };
}

function gameInfo(cs, cv) {
  let currentScore = cs || 0;
  let hiScore = JSON.parse(localStorage.getItem('hiScore')) || 5000;
  let currentVictory = cv || 0;
  let highestVictory = JSON.parse(localStorage.getItem('highestVictory')) || 0;

  const updateRecords = (score, notRender) => {
    if (score === 'hit') {
      currentScore += 500;
    } else if (score === 'reset') {
      currentScore = 0;
      currentVictory = 0;
    } else if (score) {
      currentScore += score;
      currentVictory += 1;
    }

    if (currentScore > hiScore) {
      hiScore = currentScore;
      localStorage.setItem('hiScore', JSON.stringify(hiScore));
    }

    if (currentVictory > highestVictory) {
      highestVictory = currentVictory;
      localStorage.setItem('highestVictory', JSON.stringify(highestVictory));
    }
    
    if (notRender) {
      return;
    }

    const currentScoreBoard = document.querySelector('.current-score-board');
    const hiScoreBoard = document.querySelector('.hi-score-board');
    const currentVictoryBoard = document.querySelector('.current-victory-board');
    const highestVictoryBoard = document.querySelector('.highest-victory-board');
    let padScore = currentScore.toString().padStart(6, '0');
    let padHiScore = hiScore.toString().padStart(6, '0');

    currentScoreBoard.textContent = padScore;
    hiScoreBoard.textContent = 'Hi ' + padHiScore;
    currentVictoryBoard.textContent = currentVictory;
    highestVictoryBoard.textContent = highestVictory;
  };

  const getRecords = () => [currentScore, currentVictory];

  let intervalId = 0;

  const updateMessage = (message) => {
    const messageBoard = document.querySelector('.message-board');

    if (message === 'deploy') {
      let counter = 0;
      messageBoard.textContent = 'Deploy your fleet';

      intervalId = setInterval(() => {
        counter += 1;

        if (counter === 0) {
          messageBoard.textContent = 'Deploy your fleet'
        } else if (counter === 1) {
          messageBoard.textContent = 'Drag to move'
        } else if (counter === 2) {
          messageBoard.textContent = 'Click to rotate'
        }

        if (counter === 2) {
          counter = -1;
        }
      }, 2000);
    } else if (message === 'start') {
      clearInterval(intervalId);
      messageBoard.textContent = 'Your turn';
    } else {
      messageBoard.textContent = message;
    }
  };

  const updateBtn = () => {
    const randomBtn = document.querySelector('.random-btn');
    const playBtn = document.querySelector('.play-btn');

    if (currentTurn === 0) {
      randomBtn.textContent = 'Random';
      randomBtn.classList.remove('reset-btn');
      playBtn.classList.remove('opacity');
      playBtn.classList.remove('play-btn-hover');
    } else {
      randomBtn.textContent = 'Reset';
      randomBtn.classList.remove('opacity');
      randomBtn.classList.add('reset-btn');
      playBtn.classList.add('opacity');
    }
  };

  let currentTurn = 0;
  const setCurrentTurn = (turn) => currentTurn = turn;
  const getCurrentTurn = () => currentTurn;

  function getTotalBonus(list) {
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

  const rotateEmblem = () => {
    const emblems = document.querySelectorAll('.emblem');

    emblems.forEach((emblem) => {
      emblem.classList.add('rotate-emblem');

      setTimeout(() => {
        emblem.classList.remove('rotate-emblem');
      }, 1000);
    });
  };

  const displayResult = (playerNo, waitRender, list) => {
    const boardContainerOne = document.querySelector('.board-container-one');
    const boardContainerTwo = document.querySelector('.board-container-two');
    let resultHTML = '';

    if (playerNo === 1) {
      resultHTML = `
        <div class="victory-container">
          <h2>Mission Complete</h2>
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
          <h2>Mission failed</h2>
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

        rows.forEach((row) => {
          row.classList.add('dark');
        });

        columns.forEach((column) => {
          column.classList.add('dark');
        });

        const adminLink = document.querySelector('.admin-link');
        adminLink.classList.add('dark');
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
          <h2>Congratulations!</h2>
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

  let finished;

  const setFinished = (display) => {
    if (display) {
      const title = document.querySelector('.title');
      title.classList.add('golden-title');
    } else {
      finished = true;
    }
  };

  const getFinished = () => finished;

  return {
    updateRecords,
    getRecords,
    updateMessage,
    updateBtn,
    setCurrentTurn,
    getCurrentTurn,
    rotateEmblem,
    displayResult,
    setFinished,
    getFinished,
  }
}

export function player(playerNo, playerType, currentScore, currentVictory) {
  return {
    playerNo,
    playerType,
    list: shipList(),
    board: gameBoard(),
    info: gameInfo(currentScore, currentVictory),
  };
}

if (typeof module === 'object' && module.exports) {
  module.exports = gameBoard;
}
