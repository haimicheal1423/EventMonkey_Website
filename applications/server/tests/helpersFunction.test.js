import { describe, expect, test } from '@jest/globals';
import { UserManager } from '../helpers/UserManager.js';

/**
 * ERROR: UserManager Import
 * Cannot find module 'bcrypt' from 'applications/server/helpers/UserManager.js'
 */


describe('Testing UserManager Class Functions', () => {
    test('Testing name', () => {
        expect(1)
            .toStrictEqual(1);
    });
});
