const { describe, test, expect } = require('@jest/globals');
const gameBoard = require('./src/battleship.js');

describe('gameBoard', () => {
  test('deployBoard', () => {
    expect(gameBoard().deployBoard([{ length: 4, direction: 'horizontal', coordinates: [[0, 1], [0, 2], [0, 3], [0, 4]] }, { length: 3, direction: 'vertical', coordinates: [[5, 3], [6, 3], [7, 3]] }, { length: 2, direction: 'horizontal', coordinates: [[3, 6], [3, 7]] }, { length: 1, direction: 'vertical', coordinates: [[6, 1]] }])).toEqual([[0, 'S', 'S', 'S', 'S', 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 'S', 'S'], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 'S', 0, 0, 0, 0], [0, 'S', 0, 'S', 0, 0, 0, 0], [0, 0, 0, 'S', 0, 0, 0, 0]]);
  });
});
