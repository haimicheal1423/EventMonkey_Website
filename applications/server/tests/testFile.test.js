// Note that the file name is filename.test.js

const sum = require('./testFileExample.js');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
