import add from '../models/testFileExample.js'

//console.log('../functionsFolder/testingImport.js');
describe('testFileExample.js', function() {
    test('add two numbers together', function() {
        expect(add(1, 2)).toBe(3);
    });
})

/*
To install jest and babel:
npm install --save-dev jest
npm install @babel/preset-env --save-dev
*/

/*
ERROR: FAILED IMPORT

It seems like the error comes from having another package.json file inside the server folder. It may be
causing a conflict of some kind that results it returning the error:
    SyntaxError: Cannot use import statement outside a module
If the package.json file in the server folder was removed, tests with import run fine.
I attempted to use modulePathIgnorePatterns and passing in the server package.json file, but it seems to
have no effect.
*/
