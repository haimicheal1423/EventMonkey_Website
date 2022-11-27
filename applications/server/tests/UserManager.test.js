import { jest, beforeEach, describe, it, expect } from "@jest/globals";
import bcrypt from 'bcrypt';

import { EventMonkeyDataSource } from '../helpers/Database.js';
import { UserManager } from '../helpers/UserManager.js';
import { Attendee, Organizer, TYPE_ATTENDEE, TYPE_ORGANIZER } from '../models/User.js';
import { Image } from '../models/Image.js';

const bcryptHash = jest.spyOn(bcrypt, 'hash')
                        .mockImplementation(async() => 'mock-password-hash');

const bcryptCompare = jest.spyOn(bcrypt, 'compare')
                        .mockImplementation((plainText, hashed, cb) => {
                            return cb(null, true);
                        });

beforeEach(() => {
    bcryptHash.mockClear();
    bcryptCompare.mockClear();
});

describe('checking user types', () => {
    it('checks a valid user type', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const type = 'valid-type';
        const username = 'username';
        const email = 'email';
        const password = 'secret';
        const profileImageId = 123;

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => {
                return { type, username, email, password, profileImageId }
            });

        const userId = 999;
        const userType = 'valid-type';
        const result = await manager.checkUserType(userId, userType);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        // checkUserType returns undefined when user types are valid
        expect(result).toBeUndefined();
    });

    it('checks a user with an invalid type', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const type = 'valid-type';
        const username = 'username';
        const email = 'email';
        const password = 'secret';
        const profileImageId = 123;

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => {
                return { type, username, email, password, profileImageId }
            });

        const userId = 999;
        const userType = 'invalid-type';
        const result = await manager.checkUserType(userId, userType);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`User(${userId}) is not type ${userType}`);
    });

    it('checks a user which does not exist', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        // mock a function call with undefined user details
        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => undefined);

        const userId = 999;
        const userType = 'valid-type';
        const result = await manager.checkUserType(userId, userType);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`User(${userId}) does not exist`);
    });
});

describe('getting valid users', () => {
    it('gets an existing attendee user', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const expectedImageId = 123;

        const type = TYPE_ATTENDEE;
        const username = 'username';
        const email = 'email';
        const password = 'secret';
        const profileImageId = expectedImageId;

        const expectedImage = Image.createWithId(
                expectedImageId,
                'aspect-ratio',
                Number('w'), // 'w' char byte value
                Number('h'), // 'h' char byte value
                'image-url'
            );

        const userId = 999;
        const expectedUser = new Attendee(
                userId,
                email,
                password,
                username,
                expectedImage
            );

        // mock a function call with defined attendee user details
        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => {
                return { type, email, password, username, profileImageId };
            });

        // mock an image
        jest.spyOn(dataSource, 'getImage')
            .mockImplementationOnce(async() => {
                return expectedImage;
            });

        const result = await manager.getUser(userId);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);
        expect(dataSource.getImage).toHaveBeenCalledWith(expectedImageId);

        expect(result.message).toBeUndefined();
        expect(result).toStrictEqual(expectedUser);
    });

    it('gets an existing organizer user', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const expectedImageId = 123;

        const type = TYPE_ORGANIZER;
        const username = 'username';
        const email = 'email';
        const password = 'secret';
        const profileImageId = expectedImageId;

        const expectedImage = Image.createWithId(
            expectedImageId,
            'aspect-ratio',
            Number('w'), // 'w' char byte value
            Number('h'), // 'h' char byte value
            'image-url'
        );

        const userId = 999;
        const expectedUser = new Organizer(
                userId,
                email,
                password,
                username,
                expectedImage
            );

        // mock a function call with defined attendee user details
        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => {
                return { type, email, password, username, profileImageId };
            });

        // mock an image
        jest.spyOn(dataSource, 'getImage')
            .mockImplementationOnce(async() => {
                return expectedImage;
            });

        const result = await manager.getUser(userId);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);
        expect(dataSource.getImage).toHaveBeenCalledWith(expectedImageId);

        expect(result.message).toBeUndefined();
        expect(result).toStrictEqual(expectedUser);
    });

    it('gets an existing attendee user with no profile picture', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const type = TYPE_ATTENDEE;
        const username = 'username';
        const email = 'email';
        const password = 'secret';
        const profileImageId = undefined;

        const userId = 999;
        const expectedUser = new Attendee(
            userId,
            email,
            password,
            username
        );

        // mock a function call with defined attendee user details
        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => {
                return { type, email, password, username, profileImageId };
            });

        // mock an image
        jest.spyOn(dataSource, 'getImage')
            .mockImplementationOnce(async() => undefined);

        const result = await manager.getUser(userId);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);
        expect(dataSource.getImage).toHaveBeenCalledWith(profileImageId);

        expect(result.message).toBeUndefined();
        expect(result).toStrictEqual(expectedUser);
    });

    it('gets an existing organizer user with no profile picture', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const type = TYPE_ORGANIZER;
        const username = 'username';
        const email = 'email';
        const password = 'secret';
        const profileImageId = undefined;

        const userId = 999;
        const expectedUser = new Organizer(
            userId,
            email,
            password,
            username
        );

        // mock a function call with defined organizer user details
        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => {
                return { type, email, password, username, profileImageId };
            });

        // mock an image
        jest.spyOn(dataSource, 'getImage')
            .mockImplementationOnce(async() => undefined);

        const result = await manager.getUser(userId);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);
        expect(dataSource.getImage).toHaveBeenCalledWith(profileImageId);

        expect(result.message).toBeUndefined();
        expect(result).toStrictEqual(expectedUser);
    });
});

describe('getting problematic users', () => {
    it('gets a user that does not exist', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        // mock a function call with undefined user details
        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => undefined);

        const userId = 999;
        const result = await manager.getUser(userId);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`User(${userId}) does not exist`);
    });

    it('gets a user with an unknown type', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const expectedImageId = 123;
        const type = 'UNKNOWN';

        // mock a function call with defined attendee user details
        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => {
                const username = 'username';
                const email = 'email';
                const password = 'secret';
                const profileImageId = expectedImageId;
                return { type, email, password, username, profileImageId };
            });

        // mock an image
        jest.spyOn(dataSource, 'getImage')
            .mockImplementationOnce(async() => undefined);

        const userId = 999;
        const result = await manager.getUser(userId);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);
        expect(dataSource.getImage).toHaveBeenCalledWith(expectedImageId);

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`Unknown user type (${type})`);
    });
});

describe('registering valid users', () => {
    it('registers an attendee user', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const type = TYPE_ATTENDEE;
        const username = 'username';
        const email = 'e@mail.com';
        const password = 'secret';

        const userId = 999;
        const expectedUser = new Attendee(
            userId,
            email,
            'mock-password-hash',
            username
        );

        jest.spyOn(dataSource, 'isUsernameUnique')
            .mockImplementationOnce(async() => true);

        jest.spyOn(dataSource, 'isEmailUnique')
            .mockImplementationOnce(async() => true);

        jest.spyOn(dataSource, 'addUserDetails')
            .mockImplementationOnce(async() => BigInt(userId));

        const result = await manager.register(type, username, email, password);

        expect(bcryptHash).toHaveBeenCalledWith(password, 10);
        expect(dataSource.isUsernameUnique).toHaveBeenCalledWith(username);
        expect(dataSource.isEmailUnique).toHaveBeenCalledWith(email);
        expect(dataSource.addUserDetails).toHaveBeenCalled();

        expect(result.message).toBeUndefined();
        expect(result).toStrictEqual(expectedUser);
    });

    it('registers an organizer user', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const type = TYPE_ORGANIZER;
        const username = 'username';
        const email = 'e@mail.com';
        const password = 'secret';

        const userId = 999;
        const expectedUser = new Organizer(
            userId,
            email,
            'mock-password-hash',
            username
        );

        jest.spyOn(dataSource, 'isUsernameUnique')
            .mockImplementationOnce(async() => true);

        jest.spyOn(dataSource, 'isEmailUnique')
            .mockImplementationOnce(async() => true);

        jest.spyOn(dataSource, 'addUserDetails')
            .mockImplementationOnce(async() => BigInt(userId));

        const result = await manager.register(type, username, email, password);

        expect(bcryptHash).toHaveBeenCalledWith(password, 10);
        expect(dataSource.isUsernameUnique).toHaveBeenCalledWith(username);
        expect(dataSource.isEmailUnique).toHaveBeenCalledWith(email);
        expect(dataSource.addUserDetails).toHaveBeenCalled();

        expect(result.message).toBeUndefined();
        expect(result).toStrictEqual(expectedUser);
    });
});

describe('registering problematic users', () => {
    it('registers an attendee user using a non-unique username', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const type = TYPE_ATTENDEE;
        const username = 'username';
        const email = 'e@mail.com';
        const password = 'secret';

        // mock a function call with a non-unique username
        jest.spyOn(dataSource, 'isUsernameUnique')
            .mockImplementationOnce(async() => false);

        jest.spyOn(dataSource, 'isEmailUnique')
            .mockImplementationOnce(async() => true);

        jest.spyOn(dataSource, 'addUserDetails')
            .mockImplementationOnce(async() => Promise.resolve());

        const result = await manager.register(type, username, email, password);

        expect(bcryptHash).toHaveBeenCalledWith(password, 10);

        expect(dataSource.isUsernameUnique).toHaveBeenCalledWith(username);
        expect(dataSource.isEmailUnique).toBeCalledTimes(0);
        expect(dataSource.addUserDetails).toBeCalledTimes(0);

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`Username ${username} already in use`);
    });

    it('registers an attendee user using a non-unique email', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const type = TYPE_ATTENDEE;
        const username = 'username';
        const email = 'e@mail.com';
        const password = 'secret';

        jest.spyOn(dataSource, 'isUsernameUnique')
            .mockImplementationOnce(async() => true);

        // mock a function call with a non-unique email
        jest.spyOn(dataSource, 'isEmailUnique')
            .mockImplementationOnce(async() => false);

        jest.spyOn(dataSource, 'addUserDetails')
            .mockImplementationOnce(async() => Promise.resolve());

        const result = await manager.register(type, username, email, password);

        expect(bcryptHash).toHaveBeenCalledWith(password, 10);
        expect(dataSource.isUsernameUnique).toHaveBeenCalledWith(username);
        expect(dataSource.isEmailUnique).toHaveBeenCalledWith(email);
        expect(dataSource.addUserDetails).toBeCalledTimes(0);

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`Email ${email} already in use`);
    });

    it('registers an attendee user but fails to add details', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const type = TYPE_ATTENDEE;
        const username = 'username';
        const email = 'e@mail.com';
        const password = 'secret';

        jest.spyOn(dataSource, 'isUsernameUnique')
            .mockImplementationOnce(async() => true);

        jest.spyOn(dataSource, 'isEmailUnique')
            .mockImplementationOnce(async() => true);

        jest.spyOn(dataSource, 'addUserDetails')
            .mockImplementationOnce(async() => 0n);

        const result = await manager.register(type, username, email, password);

        expect(bcryptHash).toHaveBeenCalledWith(password, 10);
        expect(dataSource.isUsernameUnique).toHaveBeenCalledWith(username);
        expect(dataSource.isEmailUnique).toHaveBeenCalledWith(email);
        expect(dataSource.addUserDetails).toHaveBeenCalled();

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`Failed to add user details`);
    });

    it('registers a user with an unknown user type', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const type = 'UNKNOWN';
        const username = 'username';
        const email = 'e@mail.com';
        const password = 'secret';

        jest.spyOn(dataSource, 'isUsernameUnique')
            .mockImplementationOnce(async() => true);

        jest.spyOn(dataSource, 'isEmailUnique')
            .mockImplementationOnce(async() => true);

        jest.spyOn(dataSource, 'addUserDetails')
            .mockImplementationOnce(async() => undefined);

        const result = await manager.register(type, username, email, password);

        expect(bcryptHash).toHaveBeenCalledWith(password, 10);

        expect(dataSource.isUsernameUnique).toHaveBeenCalledWith(username);
        expect(dataSource.isEmailUnique).toHaveBeenCalledWith(email);
        expect(dataSource.addUserDetails).toHaveBeenCalledTimes(0);

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`Unknown user type (${type})`);
    });
});

describe('valid user login', () => {
    it('performs a successful user login', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;
        const email = 'e@mail.com';
        const password = 'secret';
        const username = 'username';
        const expectedLoginDetails = { userId, email, password, username };

        jest.spyOn(dataSource, 'getLoginDetails')
            .mockImplementationOnce(async() => expectedLoginDetails);

        const details = await manager.login(email, password);

        expect(dataSource.getLoginDetails).toHaveBeenCalledWith(email);
        expect(bcryptCompare).toHaveBeenCalledTimes(1);

        expect(details).toStrictEqual(expectedLoginDetails);
    });

    it('logs in a user with an invalid email', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const nonExistingEmail = 'e@mail.com';
        const password = 'secret';

        jest.spyOn(dataSource, 'getLoginDetails')
            .mockImplementationOnce(async() => undefined);

        const details = await manager.login(nonExistingEmail, password);

        expect(dataSource.getLoginDetails)
            .toHaveBeenCalledWith(nonExistingEmail);
        expect(bcryptCompare).toHaveBeenCalledTimes(0);

        expect(details.message).toBeDefined();
        expect(details.message).toBe('Invalid username or password.');
    });

    it('logs in a user with a valid email but an invalid password', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;
        const email = 'e@mail.com';
        const password = 'secret';
        const username = 'username';
        const expectedLoginDetails = { userId, email, password, username };

        jest.spyOn(dataSource, 'getLoginDetails')
            .mockImplementationOnce(async() => expectedLoginDetails);

        jest.spyOn(bcrypt, 'compare')
            .mockImplementationOnce((plainText, hashed, cb) => {
                return cb(null, false);
            });

        const invalidPassword = 'invalid-password';
        const details = await manager.login(email, invalidPassword);

        expect(dataSource.getLoginDetails).toHaveBeenCalledWith(email);
        expect(bcryptCompare).toHaveBeenCalledTimes(1);

        expect(details.message).toBeDefined();
        expect(details.message).toBe('Invalid username or password.');
    });

    it('encounters an exception when comparing passwords', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;
        const email = 'e@mail.com';
        const password = 'secret';
        const username = 'username';
        const expectedLoginDetails = { userId, email, password, username };

        jest.spyOn(dataSource, 'getLoginDetails')
            .mockImplementationOnce(async() => expectedLoginDetails);

        jest.spyOn(bcrypt, 'compare')
            .mockImplementationOnce((plainText, hashed, cb) => {
                return cb(new Error('EVERYTHING IS BURNING DOWN'), true);
            });

        const details = await manager.login(email, password);

        expect(dataSource.getLoginDetails).toHaveBeenCalledWith(email);
        expect(bcryptCompare).toHaveBeenCalledTimes(1);

        expect(details.message).toBeDefined();
        expect(details.message).toBe('Invalid username or password.');
    });
});
