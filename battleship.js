function ship(length) {
  const hit = (id) => {
    for (let i = 0; i < shipList.length; i++) {
      const shipId = shipList[i].id;
      
      if (id === shipId) {
        shipList[i].damage += 1;
        
        if (shipList[i].length === shipList[i].damage) {
          isSunk(i);
        }

        break;
      }
    }
  };

  const isSunk = (i) => {
    shipList[i].sunk = true;
  };

  return {
    id: crypto.randomUUID(),
    length,
    damage: 0,
    sunk: false,
    hit,
  };
}

function gameBoard() {
  

  return {

  }
}

const shipOne = ship(4);
const shipTwo = ship(3);
const shipThree = ship(2);
const shipFour = ship(1);
const shipList = [shipOne, shipTwo, shipThree, shipFour];

shipOne.hit(shipTwo.id);
shipOne.hit(shipTwo.id);
shipOne.hit(shipThree.id);
shipOne.hit(shipFour.id);
console.log(shipList);

module.exports = ship;
