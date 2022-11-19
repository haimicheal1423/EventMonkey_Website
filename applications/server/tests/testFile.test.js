import { testClass } from '../models/testFileExample.js'

const testingClass = new testClass;
//console.log('../functionsFolder/testingImport.js');
describe('testFileExample.js', function() {
    test('Testing class exports', function() {
        expect(testingClass.testFunction('Hello', 'world')).toBe('Hello world');
    });
})
