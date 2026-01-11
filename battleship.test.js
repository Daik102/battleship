/* global require: writable */
const { describe, test, expect } = require('@jest/globals');
const sum = require('./src/battleship.js');

describe('gameBoard function', () => {
  test('example 1', () => {
    expect(sum(4, 5)).toBe(9);
  });
});
