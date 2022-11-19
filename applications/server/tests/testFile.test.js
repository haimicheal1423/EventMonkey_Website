import { describe, expect, test } from '@jest/globals';
import { testClass } from '../models/testFileExample.js';

const testingClass = new testClass;
//console.log('../functionsFolder/testingImport.js');
describe('testFileExample.js', () => {
    test('Testing class exports', () => {
        expect(testingClass.testFunction('Hello', 'world')).toBe('Hello world');
    });
})
