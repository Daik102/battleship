function ship(length, direction) {
  const shipTypes = ['submarine', 'destroyer', 'cruiser', 'battleship'];
  const type = shipTypes[length - 1];
  const hit = (ship) => ship.damage += 1;
  
  const isSunk = (ship) => {
    let sinking;
    
    if (ship.length === ship.damage) {
      sinking = true;
    }
    
    return sinking;
  };

  return {
    type,
    length,
    direction,
    coordinates: [],
    damage: 0,
    hit,
    isSunk,
  };
}

function gameBoard(cs, hs, cv, hv) {
  const row = 8;
  const column = 8;
  const shipList = [];
  let board = Array.from({ length: row }, () => Array(column).fill(0));
  
  const deployShip = (customSets) => {
    const defaultSets = [[0, 1, 4, 'horizontal'], [5, 3, 3, 'vertical'], [3, 6, 2, 'horizontal'], [6, 1, 1, 'vertical']];
    let fleetSets = [];
    customSets ? fleetSets = customSets : fleetSets = defaultSets;
    
    for (let i = 0; i < fleetSets.length; i++) {
      const fleetSet = fleetSets[i];
      const x = fleetSet[0];
      const y = fleetSet[1];
      const length = fleetSet[2];
      const direction = fleetSet[3];
      const newShip = ship(length, direction);
    
      for (let j = 0; j < length; j++) {
        if (direction === 'horizontal') {
          newShip.coordinates.push([x, y + j]);
          board[x][y + j] = 'S';
        } else {
          newShip.coordinates.push([x + j, y]);
          board[x + j][y] = 'S';
        }
      }
      
      shipList.push(newShip);
    }
  };

  const getDeploySets = () => {
    const customSets = [];
    
    for (let i = 0; i < shipList.length; i++) {
      const ship = shipList[i];
      const x = ship.coordinates[0][0];
      const y = ship.coordinates[0][1];
      const length = ship.length;
      const direction = ship.direction;
      const customSet = [x, y, length, direction];
      customSets.push(customSet);
    }

    return customSets;
  };

  const rotateShip = (x, y) => {
    for (let i = 0; i < shipList.length; i++) {
      const ship = shipList[i];
      const length = ship.length;
      const bow = ship.coordinates[0];
      const bowX = bow[0];
      const bowY = bow[1];

      if (length === 1) {
        return;
      }

      for (let j = 0; j < length; j++) {
        let coordinates = ship.coordinates[j];
        let coordinateX = coordinates[0];
        let coordinateY = coordinates[1];
        
        if (x === coordinateX && y === coordinateY) {
          const direction = ship.direction;
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
            // Update the ship's coordinates on the shipList.
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
        // Check if it's possible to move horizontally.
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
        // Check if it's possible to move vertically.
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

  const setMoveLocation = (target, start) => {
    if (start) {
      startTarget = target;
    } else {
      if (!startTarget.classList.contains('ship')) {
        return;
      }
      
      for (let i = 0; i < shipList.length; i++) {
        const ship = shipList[i];
        
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
    }
  };

  const deployRandom = () => {
    board = Array.from({ length: row }, () => Array(column).fill(0));
    
    for (let i = 0; i < shipList.length; i++) {
      const ship = shipList[i];
      const bow = ship.coordinates[0];
      const bowX = bow[0];
      const bowY = bow[1];
      
      function getRandomLocation() {
        const endX = Math.floor(Math.random() * row);
        const endY = Math.floor(Math.random() * column);
        const zeroOrOne = Math.floor(Math.random() * 2);
        let direction = '';
      
        if (zeroOrOne === 0) {
          direction = 'horizontal';
        } else {
          direction = 'vertical';
        }
        
        const cannotMove = moveShip(bowX, bowY, endX, endY, ship, direction);
        ship.direction = direction;

        if (cannotMove) {
          getRandomLocation();
        }
      }
      
      getRandomLocation();
    }

    renderBoard();
    return board;
  };

  const markupTarget = () => {
    const squares = document.querySelectorAll('.square-two');

    squares.forEach((square) => {
      square.addEventListener('mouseenter', () => {
        square.classList.add('target');
      });

      square.addEventListener('mouseleave', () => {
        square.classList.remove('target');
      });
    });
  };

  const receiveAttack = (x, y, playerNo, otherBoard) => {
    const square = board[x][y];
    let result = '';
    
    if (square === 0) {
      result = 'miss';
      board[x][y] = 1;
    } else if (square !== 'S') {
      return;
    } else {
      for (let i = 0; i < shipList.length; i++) {
        const ship = shipList[i];
        
        for (let j = 0; j < ship.length; j++) {
          const coordinates = ship.coordinates[j];
          const coordinateX = coordinates[0];
          const coordinateY = coordinates[1];
          
          if (coordinateX === x && coordinateY === y) {
            result = 'hit';
            ship.hit(ship);
            board[x][y] = 'X';
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
            
            const wrapper = document.querySelector('.wrapper');
            wrapper.classList.add('hit');

            setTimeout(() => {
              wrapper.classList.remove('hit');
            }, 100);

            const sinking = ship.isSunk(ship);

            if (sinking) {
              // Put splash after sinking.
              for (let k = 0; k < ship.length; k++) {
                const coordinates = ship.coordinates[k];
                const coordinateX = coordinates[0];
                const coordinateY = coordinates[1];
                board[coordinateX][coordinateY] = 'D';

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
            }
          }
        }
      }
    }
    
    renderBoard(playerNo, otherBoard);
    return result;
  };

  const getComputerMove = (wait, otherBoard) => {
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
      const result = receiveAttack(x, y, 1, otherBoard);
      
      if (result === 'hit') {
        const winner = checkTheWinner(1, otherBoard);

        if (!winner) {
          getComputerMove(wait, otherBoard);
        }
      } else {
        updateMessage('Your turn');
        markupTarget();
        wait();
      }
    }, 1000);
  };

  const checkTheWinner = (playerNo, otherBoard) => {
    const sunkCounter = shipList.reduce((acc, curr, i) => acc + curr.isSunk(shipList[i]), 0);
        
    if (sunkCounter === shipList.length) {
      if (!otherBoard) {
        return playerNo;
      }

      if (playerNo === 2) {
        const boardContainerTwo = document.querySelector('.board-container-two');
        const dialogVictory = document.querySelector('.dialog-victory');
        boardContainerTwo.classList.add('dark');

        setTimeout(() => {
          updateMessage('You win!');
          dialogVictory.showModal();
        }, 1000);
      } else {
        const boardContainerOne = document.querySelector('.board-container-one');
        const dialogDefeat = document.querySelector('.dialog-defeat');
        boardContainerOne.classList.add('dark');

        setTimeout(() => {
          updateMessage('You lose');
          dialogDefeat.showModal();
          
          const rankList = ['Seaman', 'Petty Officer', 'Chief Petty Officer', 'Ensign', 'Lieutenant Jr. Grade', 'Lieutenant', 'Lieutenant Commander', 'Commander', 'Captain', 'Rear Admiral', 'Vice Admiral'];
          let rankIndex = Math.floor(currentVictory / 2) + 1;
          
          if (currentVictory === 0) {
            rankIndex = 0;
          }

          const finalVictoryBoard = document.querySelector('.final-victory-board');
          const rankBoard = document.querySelector('.rank-board');
          finalVictoryBoard.textContent = currentVictory + ' wins';
          rankBoard.textContent = rankList[rankIndex];
        }, 1000);
      }
      
      return playerNo;
    }
  };

  const getTotalBonus = () => {
    const bonusScores = document.querySelectorAll('.bonus-score');
    const totalBonusScore = document.querySelector('.total-bonus-score');
    let totalBonus = 0;

    bonusScores.forEach((score, i) => {
      let bonus = 2000 - i * 500;
      
      if (!shipList[i].isSunk(shipList[i])) {
        totalBonus += bonus;
      } else {
        bonus = 0;
      }

      score.textContent = bonus;
    });

    totalBonusScore.textContent = totalBonus;
    return totalBonus;
  };

  let currentScore = 0;
  let hiScore = JSON.parse(localStorage.getItem('hiScore')) || 5000;
  let currentVictory = 0;
  let highestVictory = JSON.parse(localStorage.getItem('highestVictory')) || 0;
  
  if (cs) {
    currentScore = cs;
    hiScore = hs;
    currentVictory = cv;
    highestVictory = hv;
  }

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

  const updateMessage = (message) => {
    const messageBoard = document.querySelector('.message-board');
    messageBoard.textContent = message;
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
  
  const getBoard = () => board;
  const getRecords = () => [currentScore, hiScore, currentVictory, highestVictory];

  let currentTurn = 0;
  const setCurrentTurn = (turn) => currentTurn = turn;
  const getCurrentTurn = () => currentTurn;

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

  const renderBoard = (playerNo, otherBoard) => {
    const boardContainerOne = document.querySelector('.board-container-one');
    const boardContainerTwo = document.querySelector('.board-container-two');
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

        if (playerNo === 2) {
          if (otherBoard[i][j] === 1) {
            squareOne.classList.add('miss');
          } else if (otherBoard[i][j] === 2) {
            squareOne.classList.add('splash');
          } else if (otherBoard[i][j] === 'X' || otherBoard[i][j] === 'D') {
            squareOne.classList.add('hit');
          } else if (otherBoard[i][j] === 'S') {
            squareOne.classList.add('ship');
            squareOne.setAttribute('draggable', 'false');
          }

          if (board[i][j] === 1) {
            squareTwo.classList.add('miss');
          } else if (board[i][j] === 2) {
            squareTwo.classList.add('splash');
          } else if (board[i][j] === 'X' || board[i][j] === 'D') {
            squareTwo.classList.add('hit');
          }
        } else {
          if (board[i][j] === 'S') {
            squareOne.classList.add('ship');
            squareOne.setAttribute('draggable', 'false');

            if (currentTurn === 0) {
              squareOne.setAttribute('draggable', 'true');
              squareOne.classList.add('grabbing');
            }
          }

          if (currentTurn === 0) {
            squareTwo.classList.add('initial');
          } else {
            if (board[i][j] === 1) {
              squareOne.classList.add('miss');
            } else if (board[i][j] === 2) {
              squareOne.classList.add('splash');
            } else if (board[i][j] === 'X' || board[i][j] === 'D') {
              squareOne.classList.add('hit');
            }

            if (otherBoard[i][j] === 1) {
              squareTwo.classList.add('miss');
            } else if (otherBoard[i][j] === 2) {
              squareTwo.classList.add('splash');
            } else if (otherBoard[i][j] === 'X' || otherBoard[i][j] === 'D') {
              squareTwo.classList.add('hit');
            }
          }
        }

        boardContainerOne.appendChild(squareOne);
        boardContainerTwo.appendChild(squareTwo);
      }
    }
  };
  
  return {
    deployShip,
    getDeploySets,
    rotateShip,
    setMoveLocation,
    deployRandom,
    markupTarget,
    receiveAttack,
    getComputerMove,
    checkTheWinner,
    getTotalBonus,
    updateRecords,
    updateMessage,
    updateBtn,
    getBoard,
    getRecords,
    setCurrentTurn,
    getCurrentTurn,
    setFinished,
    getFinished,
    renderBoard,
  };
}

export function player(playerNo, playerType, currentScore, hiScore, currentVictory, highestVictory) {
  return {
    playerNo,
    playerType,
    board: gameBoard(currentScore, hiScore, currentVictory, highestVictory),
  };
}
// eslint-disable-next-line
module.exports = gameBoard;
